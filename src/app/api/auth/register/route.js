// import { connectDb } from '@/configs/connectDb';
// import { Auth } from '@/models/auth.model';
// import { sendToken } from '@/services/auth/sendToken';
// import { asyncHandler } from '@/utils/asyncHandler';
// import { customError } from '@/utils/customError';
// import { NextResponse } from 'next/server';

// export const POST = asyncHandler(async (req) => {
//   await connectDb();

//   const body = await req.json();
//   const { fullName, role, email, password, creatorId } = body;

//   // ✅ Required field validation
//   if (!fullName || !email || !password) {
//     throw new customError(400, 'Full name, email, and password are required');
//   }

//   // ✅ Check for existing user
//   const existingUser = await Auth.findOne({ email });
//   if (existingUser) {
//     throw new customError(403, 'User already exists. Please login');
//   }

//   // ✅ Create user (include role only if provided)
//   const newUserData = {
//     fullName,
//     email,
//     password,
//     creatorId: creatorId || null,
//   };

//   if (role) newUserData.role = role; // Add role only if it exists

//   const newUser = await Auth.create(newUserData);
//   if (!newUser) {
//     throw new customError(500, 'Error while creating user');
//   }

//   // ✅ If created by another user (creatorId provided) → don’t send token
//   if (creatorId) {
//     return NextResponse.json({
//       success: true,
//       message: 'User created successfully by creator',
//       data: newUser,
//     });
//   }

//   // ✅ Otherwise (normal registration) → send token
//   return await sendToken(newUser, 201, 'User registered successfully');
// });
/////////////////

// app/api/auth/register/route.js - UPDATED
import { connectDb } from '@/configs/connectDb';
import { Auth } from '@/models/auth.model';
import { sendToken } from '@/services/auth/sendToken';
import { asyncHandler } from '@/utils/asyncHandler';
import { customError } from '@/utils/customError';
import { NextResponse } from 'next/server';
import { getLoggedInUser } from '@/lib/getLoggedInUser';

export const POST = asyncHandler(async (req) => {
  await connectDb();

  const body = await req.json();
  let { fullName, role, email, password } = body;

  // ✅ Default role if not provided
  if (!role) role = 'admin';

  // ✅ Required fields
  if (!fullName || !email || !password) {
    throw new customError(400, 'Full name, email, and password are required');
  }

  // ✅ Prevent duplicate email
  const existingUser = await Auth.findOne({ email });
  if (existingUser) throw new customError(403, 'User already exists');

  // ✅ Check current logged-in user (if any)
  let currentUser = null;
  try {
    currentUser = await getLoggedInUser();
    console.log('🔍 Register API - Current user:', currentUser?.role || 'No user logged in');
  } catch (error) {
    console.log('🔍 Register API - No user logged in');
    currentUser = null;
  }

  // 🧠 CASE 1: No user logged in → only allow admin registration
  if (!currentUser) {
    console.log('👤 First user registration attempt');

    // Check if this is the VERY first user in the system
    // const userCount = await Auth.countDocuments();

    // if (userCount > 0) {
    //   throw new customError(403, 'Please log in to create new users');
    // }

    if (role !== 'admin') {
      throw new customError(403, 'You can only register an Admin account as the first user.');
    }

    // ✅ Create first Admin
    const newAdmin = await Auth.create({
      fullName,
      email,
      password,
      role: 'admin',
    });

    console.log('✅ First admin created successfully');

    // Auto login the new admin
    return await sendToken(newAdmin, 201, 'Admin registered successfully');
  }

  // 🧠 CASE 2: Logged-in user → role hierarchy
  console.log('👤 Existing user creating new user - Role:', currentUser.role);

  if (currentUser.role === 'super_admin') {
    // Super admin can create any role except another super_admin
    if (role === 'super_admin') {
      throw new customError(403, 'Cannot create another super admin.');
    }
    // Allow super_admin to create admin, inspection, and manager roles
    const allowedRoles = ['admin', 'inspection', 'building_manager'];
    if (!allowedRoles.includes(role)) {
      throw new customError(
        403,
        'Super Admin can only create Admin, Inspection, and Manager users.'
      );
    }
  } else if (currentUser.role === 'admin') {
    // Admin can only create manager and user roles
    const allowedRoles = [
      'report_manager',
      'subscription_manager',
      'building_manager',
      'building_inspector',
    ];
    if (!allowedRoles.includes(role)) {
      throw new customError(
        403,
        'Admin can only create Manager, Reporter, Subscription, and User accounts.'
      );
    }
  } else {
    throw new customError(403, 'You do not have permission to create users.');
  }

  // ✅ Create sub-user
  const newUser = await Auth.create({
    fullName,
    email,
    password,
    role,
    creatorId: currentUser._id,
  });

  console.log('✅ New user created with role:', role);

  return NextResponse.json({
    success: true,
    message: 'User created successfully',
    data: {
      _id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
      role: newUser.role,
      createdAt: newUser.createdAt,
    },
  });
});
