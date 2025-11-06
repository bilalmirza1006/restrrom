import { getEnv } from '@/configs/config';
import {
  clearCustomMySqlConnection,
  connectCustomMySql,
  connectCustomMySqll,
  connectDb,
} from '@/configs/connectDb';
import { accessTokenOptions } from '@/configs/constants';
import { configureCloudinary, removeFromCloudinary, uploadOnCloudinary } from '@/lib/cloudinary';
import { isAuthenticated } from '@/lib/isAuthenticated';
import { Auth } from '@/models/auth.model';
import { asyncHandler } from '@/utils/asyncHandler';
import customError from '@/utils/customError';
import sendResponse from '@/utils/sendResponse';
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { Sequelize } from 'sequelize';
import mysql2 from 'mysql2';

export const GET = asyncHandler(async () => {
  try {
    await connectDb();
    const { user: userGet, accessToken } = await isAuthenticated();
    const user = await Auth.findById(userGet?._id).select('-password');
    if (!user) throw new customError(404, 'User not found');

    try {
      await connectCustomMySqll(String(user?._id));
      console.log('✅ Custom DB connected successfully');
    } catch (err) {
      console.error('❌ Custom DB connection failed:', err.message);
      throw new customError(500, `Custom DB connection failed: ${err.message}`);
    }

    return sendResponse(NextResponse, 'User profile fetched successfully', user, accessToken);
  } catch (err) {
    console.error('🔥 API runtime error:', err);
    throw err; // important to bubble it up to asyncHandler
  }
});

export const PUT = asyncHandler(async (req) => {
  await connectDb();
  configureCloudinary();
  const { user: userGet, accessToken } = await isAuthenticated();
  const user = await Auth.findById(userGet?._id).select('+password');
  if (!user) throw new customError(404, 'User not found');

  const formData = await req.formData();
  const allowedFields = [
    'fullName',
    'email',
    'dob',
    'phoneNumber',
    'gender',
    'nationality',
    'image',
    'interval',
    'isCustomDb',
    'customDbHost',
    'customDbPassword',
    'customDbUsername',
    'customDbName',
    'customDbPort',
    'isCustomDbConnected',
    'subscriptionId',
    'oldPassword',
    'newPassword',
  ];

  const updatePayload = {};
  for (const field of allowedFields) {
    const value = formData.get(field);
    if (value !== null && value !== undefined) {
      updatePayload[field] = value;
    }
  }

  if (Object.keys(updatePayload).length === 0) {
    throw new customError(400, 'Please provide at least one field to update');
  }

  const oldPassword = formData.get('oldPassword');
  const newPassword = formData.get('newPassword');

  // 🔐 ROLE-BASED PASSWORD VALIDATION
  if (newPassword) {
    const userRole = user.role;
    console.log(`🔍 Password update attempt by role: ${userRole}`);

    // If user is admin, skip old password validation
    if (userRole === 'admin' || userRole === 'super_admin') {
      console.log(`✅ Admin/SuperAdmin detected - skipping old password validation`);

      if (!newPassword) {
        throw new customError(400, 'New password is required');
      }

      // Validate new password strength
      if (newPassword.length < 6) {
        throw new customError(400, 'New password must be at least 6 characters long');
      }

      user.password = newPassword;
      await user.save();
      console.log('✅ Password updated without old password validation (Admin privilege)');
    } else {
      // For non-admin roles, require old password
      console.log(`🔐 Non-admin role (${userRole}) - requiring old password validation`);

      if (!oldPassword) {
        throw new customError(400, 'Old password is required for your role');
      }

      if (!user?.password) {
        throw new customError(400, 'User has no password set.');
      }

      const matchPwd = await bcrypt.compare(oldPassword, user.password);
      if (!matchPwd) {
        throw new customError(400, 'Wrong Old Password');
      }

      if (!newPassword) {
        throw new customError(400, 'New password is required');
      }

      // Validate new password strength
      if (newPassword.length < 6) {
        throw new customError(400, 'New password must be at least 6 characters long');
      }

      user.password = newPassword;
      await user.save();
      console.log('✅ Password updated with old password validation');
    }
  }

  // 🖼️ Image Upload Logic
  const newImage = formData.get('image');
  if (newImage && typeof newImage === 'object') {
    // Remove old image from Cloudinary if it exists
    if (user.image?.public_id) {
      await removeFromCloudinary(user.image.public_id);
    }
    // Upload new image
    const cloudImage = await uploadOnCloudinary(newImage, 'user_profiles');
    if (!cloudImage || !cloudImage.secure_url || !cloudImage.public_id) {
      throw new customError(500, 'Image upload failed');
    }
    updatePayload.image = {
      url: cloudImage.secure_url,
      public_id: cloudImage.public_id,
    };
  }

  // 🗄️ Custom Database Logic
  const enableCustom = formData.get('isCustomDb') === 'true';
  const disableCustom = formData.get('isCustomDb') === 'false';
  let credsChanged = false;

  if (enableCustom) {
    const customDbHost = formData.get('customDbHost');
    const customDbName = formData.get('customDbName');
    const customDbUsername = formData.get('customDbUsername');
    const customDbPassword = formData.get('customDbPassword');
    const customDbPort = formData.get('customDbPort');

    const hasAllCreds =
      customDbHost && customDbName && customDbUsername && customDbPassword && customDbPort;
    if (!hasAllCreds) throw new customError(400, 'Please provide complete custom DB credentials');

    /* Test the DB connection */
    try {
      const probe = new Sequelize(customDbName, customDbUsername, customDbPassword, {
        host: customDbHost,
        port: Number(customDbPort) || 3306,
        logging: false,
        dialect: 'mysql',
        dialectModule: mysql2,
      });
      await probe.authenticate();
      await probe.close();
      console.log('🔍 Custom DB connection test successful');
    } catch (err) {
      console.error('❌ Custom DB authentication failed:', err.message);
      throw new customError(
        400,
        'Unable to connect to your custom MySQL database. Please verify the credentials'
      );
    }

    /* Check if credentials changed */
    if (
      user.customDbHost !== customDbHost ||
      user.customDbName !== customDbName ||
      user.customDbUsername !== customDbUsername ||
      user.customDbPassword !== customDbPassword ||
      String(user.customDbPort) !== String(customDbPort) ||
      user.isCustomDb !== true
    )
      credsChanged = true;

    user.isCustomDb = true;
    user.customDbHost = customDbHost;
    user.customDbPassword = customDbPassword;
    user.customDbUsername = customDbUsername;
    user.customDbName = customDbName;
    user.customDbPort = customDbPort;
  }

  if (disableCustom) {
    if (user.isCustomDb) credsChanged = true;
    user.isCustomDb = false;
  }

  const userId = user?._id;

  /* Save user and clear cache if credentials changed */
  await user.save();
  if (credsChanged) clearCustomMySqlConnection(String(userId));

  await connectCustomMySqll(String(userId));

  // Update other fields (excluding password which was already handled)
  const fieldsToUpdate = { ...updatePayload };
  delete fieldsToUpdate.oldPassword;
  delete fieldsToUpdate.newPassword;

  const updatedUser = await Auth.findByIdAndUpdate(userGet._id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  }).select('-password');

  return sendResponse(NextResponse, 'User profile updated successfully', updatedUser, accessToken);
});

// 🔴 DELETE API - Add this new endpoint
export const DELETE = asyncHandler(async (req) => {
  await connectDb();
  const { user: currentUser, accessToken } = await isAuthenticated();

  if (!currentUser) {
    throw new customError(401, 'Please login first');
  }

  const user = await Auth.findById(currentUser._id);
  if (!user) {
    throw new customError(404, 'User not found');
  }

  const { searchParams } = new URL(req.url);
  const userIdToDelete = searchParams.get('userId');

  // 🛡️ Role-based deletion permissions
  const userRole = currentUser.role;

  // If no specific userId provided, user is deleting their own account
  if (!userIdToDelete || userIdToDelete === currentUser._id.toString()) {
    console.log(`🗑️ User ${currentUser._id} is deleting their own account`);

    // Delete user's image from Cloudinary if exists
    if (user.image?.public_id) {
      await removeFromCloudinary(user.image.public_id);
    }

    // Clear custom DB connection
    clearCustomMySqlConnection(String(currentUser._id));

    // Delete the user
    await Auth.findByIdAndDelete(currentUser._id);

    console.log('✅ User account deleted successfully');

    // Clear cookies or handle logout
    const response = NextResponse.json({
      success: true,
      message: 'Your account has been deleted successfully',
    });

    // Clear authentication cookies
    response.cookies.set(getEnv('ACCESS_TOKEN_NAME'), '', {
      expires: new Date(0),
      httpOnly: true,
    });
    response.cookies.set(getEnv('REFRESH_TOKEN_NAME'), '', {
      expires: new Date(0),
      httpOnly: true,
    });

    return response;
  }

  // 🛡️ If deleting another user, check permissions
  console.log(
    `🔍 User ${currentUser._id} (${userRole}) attempting to delete user ${userIdToDelete}`
  );

  // Check if target user exists
  const targetUser = await Auth.findById(userIdToDelete);
  if (!targetUser) {
    throw new customError(404, 'User to delete not found');
  }

  // Permission logic based on roles
  const canDeleteUser = () => {
    // Super admin can delete anyone except themselves
    if (userRole === 'super_admin') {
      return targetUser.role !== 'super_admin'; // Cannot delete another super_admin
    }

    // Admin can delete manager and user roles
    if (userRole === 'admin') {
      const allowedToDelete = [
        'report_manager',
        'subscription-manager',
        'building_manager',
        'building_inspector',
      ];
      return allowedToDelete.includes(targetUser.role);
    }

    // Other roles cannot delete anyone else
    return false;
  };

  if (!canDeleteUser()) {
    throw new customError(403, 'You do not have permission to delete this user');
  }

  // Perform deletion
  if (targetUser.image?.public_id) {
    await removeFromCloudinary(targetUser.image.public_id);
  }

  clearCustomMySqlConnection(String(userIdToDelete));
  await Auth.findByIdAndDelete(userIdToDelete);

  console.log(`✅ User ${userIdToDelete} deleted by ${currentUser._id}`);

  return NextResponse.json({
    success: true,
    message: 'User deleted successfully',
  });
});
