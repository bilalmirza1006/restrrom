'use client';
import React, { useState } from 'react';
import Input from '@/components/global/small/Input';
import Button from '@/components/global/small/Button';
import Dropdown from '@/components/global/small/Dropdown';
import toast from 'react-hot-toast';
import { useRegisterMutation } from '@/features/auth/authApi';
import { useSelector } from 'react-redux';

function AddUsers({ onClose, data }) {
  const [register, { isLoading }] = useRegisterMutation();
  const { user } = useSelector(state => state.auth);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
  });

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddUser = async e => {
    e.preventDefault();

    if (!formData.fullName || !formData.email || !formData.password || !formData.role) {
      return toast.error('All fields are required');
    }

    if (formData.password !== formData.confirmPassword) {
      return toast.error('Passwords do not match');
    }

    try {
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        creatorId: data?.data?._id,
      };

      const res = await register(payload).unwrap();
      toast.success(res?.message || 'User added successfully');
      onClose?.();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to add user');
    }
  };
  console.log('user', user.role);

  const allRoleOptions = [
    { option: 'Building Manager', value: 'building_manager' },
    { option: 'Report Manager', value: 'report_manager' },
    { option: 'Subscription Manager', value: 'subscription_manager' },
    { option: 'Building Inspector', value: 'building_inspector' },
    // { option: 'User', value: 'user' },
  ];

  const roleOptions =
    user.role === 'super_admin' ? [{ option: 'Admin', value: 'admin' }] : allRoleOptions;

  return (
    <form onSubmit={handleAddUser} className="space-y-4">
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
        label="Select Role"
        defaultText="Select Role"
        options={roleOptions}
        onSelect={value => setFormData(prev => ({ ...prev, role: value }))}
        required
      />
      <Input
        label="Password"
        name="password"
        type="password"
        value={formData.password}
        onChange={handleInputChange}
        required
      />
      <Input
        label="Confirm Password"
        name="confirmPassword"
        type="password"
        value={formData.confirmPassword}
        onChange={handleInputChange}
        required
      />

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          text="Cancel"
          onClick={onClose}
          cn="!bg-gray-500 hover:!bg-gray-600 !w-1/2"
        />
        <Button
          text={isLoading ? 'Adding...' : 'Add User'}
          type="submit"
          disabled={isLoading}
          cn={`!w-1/2 ${isLoading && 'opacity-60 cursor-not-allowed'}`}
        />
      </div>
    </form>
  );
}

export default AddUsers;
