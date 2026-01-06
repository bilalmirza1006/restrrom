// app/api/user/profile/[userId]/route.js - COMPLETE
import { connectDb } from '@/configs/connectDb';
import { Auth } from '@/models/auth.model';
import { asyncHandler } from '@/utils/asyncHandler';
import customError from '@/utils/customError';
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { isAuthenticated } from '@/lib/isAuthenticated';
import { configureCloudinary, removeFromCloudinary, uploadOnCloudinary } from '@/lib/cloudinary';
import { clearCustomMySqlConnection } from '@/configs/connectDb';

// 🔍 GET User by ID
export const GET = asyncHandler(async (req, { params }) => {
  await connectDb();

  // 👇 AWAIT THE PARAMS
  const { userId } = await params;

  const { user: currentUser } = await isAuthenticated();

  if (!currentUser) {
    throw new customError(401, 'Please login first');
  }

  // Check permissions - only admin/super_admin can view other users
  if (!['admin', 'super_admin'].includes(currentUser.role)) {
    throw new customError(403, 'You do not have permission to view other users');
  }

  // Find the user
  const user = await Auth.findById(userId).select('-password');
  if (!user) {
    throw new customError(404, 'User not found');
  }

  return NextResponse.json({
    success: true,
    message: 'User fetched successfully',
    data: user,
  });
});

// ✏️ PUT (Update) User by ID

export const PUT = asyncHandler(async (req, { params }) => {
  await connectDb();
  await configureCloudinary(); // ensure Cloudinary is configured

  const { userId } = await params;
  console.log('userIddd', userId);
  const { user: currentUser } = await isAuthenticated();
  if (!currentUser) throw new customError(401, 'Please login first');

  if (!['admin', 'super_admin'].includes(currentUser.role)) {
    throw new customError(403, 'You do not have permission to update other users');
  }

  const userToUpdate = await Auth.findById(userId).select('+password');
  if (!userToUpdate) throw new customError(404, 'User not found');

  if (currentUser.role === 'admin' && userToUpdate.role === 'super_admin') {
    throw new customError(403, 'Admin cannot update super admin user');
  }

  // -------------------------------
  // Parse FormData
  // -------------------------------
  const form = await req.formData();
  const updateData = {};

  for (const [key, value] of form.entries()) {
    if (key === 'newPassword' || key === 'oldPassword') continue; // handled separately

    // Handle image upload
    if (key === 'image' && value && typeof value === 'object') {
      const uploaded = await uploadOnCloudinary(value, 'profile-images');
      if (!uploaded) throw new customError(500, 'Failed to upload image');

      updateData.image = {
        url: uploaded.secure_url,
        public_id: uploaded.public_id,
      };
      continue;
    }

    if (value !== null && value !== undefined) {
      // Convert numbers
      if (['interval', 'customDbPort'].includes(key)) {
        updateData[key] = Number(value);
      } else if (['isCustomDb', 'isCustomDbConnected', 'isTrialDone'].includes(key)) {
        updateData[key] = value === 'true';
      } else {
        updateData[key] = value;
      }
    }
  }

  // -------------------------------
  // Password Update
  // -------------------------------
  const newPassword = form.get('newPassword');
  const oldPassword = form.get('oldPassword');

  if (newPassword) {
    if (newPassword.length < 6)
      throw new customError(400, 'Password must be at least 6 characters');

    if (currentUser.role === 'super_admin') {
      // Super admin can update without old password
      userToUpdate.password = newPassword;
      await userToUpdate.save();
    } else {
      // Admin or other roles must provide old password
      if (!oldPassword) {
        throw new customError(400, 'Old password is required');
      }

      const isMatch = await userToUpdate.comparePassword(oldPassword);
      if (!isMatch) {
        throw new customError(400, 'Old password is incorrect');
      }

      userToUpdate.password = newPassword;
      await userToUpdate.save();
    }
  }

  // -------------------------------
  // Apply update for other fields
  // -------------------------------
  const updatedUser = await Auth.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  }).select('-password');

  return NextResponse.json({
    success: true,
    message: 'User updated successfully',
    data: updatedUser,
  });
});

// 🗑️ DELETE User by ID
export const DELETE = asyncHandler(async (req, { params }) => {
  await connectDb();

  // 👇 AWAIT THE PARAMS
  const { userId } = await params;

  const { user: currentUser } = await isAuthenticated();

  if (!currentUser) {
    throw new customError(401, 'Please login first');
  }

  // Check permissions - only admin/super_admin can delete other users
  if (!['admin', 'super_admin'].includes(currentUser.role)) {
    throw new customError(403, 'You do not have permission to delete users');
  }

  // Find the user to delete
  const userToDelete = await Auth.findById(userId);
  if (!userToDelete) {
    throw new customError(404, 'User not found');
  }

  // Prevent users from deleting themselves
  if (userId === currentUser._id.toString()) {
    throw new customError(
      403,
      'You cannot delete your own account using this endpoint. Use the profile deletion instead.'
    );
  }

  // Prevent admin from deleting super_admin
  if (currentUser.role === 'admin' && userToDelete.role === 'super_admin') {
    throw new customError(403, 'Admin cannot delete super admin user');
  }

  // Define allowed roles for deletion based on current user role
  const canDeleteUser = () => {
    if (currentUser.role === 'super_admin') {
      // Super admin can delete anyone except themselves
      return userToDelete.role !== 'super_admin';
    }

    if (currentUser.role === 'admin') {
      // Admin can delete manager and user roles
      const allowedToDelete = [
        'building_manager',
        'report_manager',
        'subscription-manager',
        'building_inspector',
        'user',
      ];
      return allowedToDelete.includes(userToDelete.role);
    }

    return false;
  };

  if (!canDeleteUser()) {
    throw new customError(403, 'You do not have permission to delete this user');
  }

  console.log(`🗑️ User ${userId} deleted by ${currentUser._id} (${currentUser.role})`);

  // Clean up resources
  if (userToDelete.image?.public_id) {
    await removeFromCloudinary(userToDelete.image.public_id);
  }

  // Clear custom DB connection if exists
  clearCustomMySqlConnection(String(userId));

  // Delete the user
  await Auth.findByIdAndDelete(userId);

  return NextResponse.json({
    success: true,
    message: 'User deleted successfully',
  });
});
////////////////////////////////////////////////////////////////
