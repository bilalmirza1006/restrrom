// components/user/managers/EditUser.js - UPDATED
'use client';
import React, { useState, useEffect } from 'react';
import Input from '@/components/global/small/Input';
import Button from '@/components/global/small/Button';
import Dropdown from '@/components/global/small/Dropdown';
import toast from 'react-hot-toast';
import { useUpdateUserByIdMutation } from '@/features/auth/authApi';
// import { useUpdateUserMutation } from '@/features/auth/authApi'; // 👈 Use updateUser instead of updateProfile

function EditUser({ user, onClose }) {
  const [updateUser, { isLoading }] = useUpdateUserByIdMutation();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    role: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        role: user.role || '',
        newPassword: '',
        confirmPassword: '',
      });
    }
  }, [user]);

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleUpdateUser = async e => {
    e.preventDefault();

    if (!formData.fullName || !formData.email || !formData.role) {
      return toast.error('Name, email and role are required');
    }

    // Password validation
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      return toast.error('Passwords do not match');
    }

    try {
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        role: formData.role,
      };

      // Only include password if provided
      if (formData.newPassword) {
        payload.newPassword = formData.newPassword;
      }

      // Call updateUser with userId and data
      const res = await updateUser({
        userId: user._id,
        data: payload,
      }).unwrap();

      toast.success(res?.message || 'User updated successfully');
      onClose?.();
    } catch (err) {
      console.error('Update error:', err);
      toast.error(err?.data?.message || 'Failed to update user');
    }
  };

  const roleOptions = [
    { option: 'Building Manager', value: 'building_manager' },
    { option: 'Report Manager', value: 'report_manager' },
    { option: 'Subscription Manager', value: 'subscription_manager' },
    { option: 'Building Inspector', value: 'building_inspector' },
    { option: 'User', value: 'user' },
  ];

  return (
    <form onSubmit={handleUpdateUser} className="space-y-4">
      <Input
        label="Full Name"
        name="fullName"
        value={formData.fullName}
        onChange={handleInputChange}
        required
      />

      <Input
        label="Email"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleInputChange}
        required
      />

      <Dropdown
        label="Role"
        defaultText="Select Role"
        options={roleOptions}
        selectedValue={formData.role}
        onSelect={value => setFormData(prev => ({ ...prev, role: value }))}
        required
      />

      {/* Optional Password Update Section */}
      <div className="mt-4 border-t pt-4">
        <h3 className="mb-3 text-lg font-medium text-gray-900">Update Password (Optional)</h3>

        <Input
          label="New Password"
          name="newPassword"
          type="password"
          value={formData.newPassword}
          onChange={handleInputChange}
          placeholder="Leave blank to keep current password"
        />

        <Input
          label="Confirm New Password"
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          placeholder="Confirm new password"
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          text="Cancel"
          onClick={onClose}
          cn="!bg-gray-500 hover:!bg-gray-600 !w-1/2"
        />
        <Button
          text={isLoading ? 'Updating...' : 'Update User'}
          type="submit"
          disabled={isLoading}
          cn={`!w-1/2 ${isLoading && 'opacity-60 cursor-not-allowed'}`}
        />
      </div>
    </form>
  );
}

export default EditUser;
