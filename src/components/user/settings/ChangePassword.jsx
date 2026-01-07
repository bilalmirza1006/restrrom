'use client';
import Button from '@/components/global/small/Button';
import Input from '@/components/global/small/Input';
import { useUpdateProfileMutation } from '@/features/auth/authApi';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { IoEyeOffOutline, IoEyeOutline } from 'react-icons/io5';
import { useSelector } from 'react-redux';

const ChangePassword = () => {
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();
  console.log('oldPassword', oldPassword, confirmPassword);
  const { user } = useSelector(state => state.auth);
  const userId = user?.user?._id;

  const handleSubmit = async event => {
    event.preventDefault();
    try {
      if (!oldPassword || !newPassword || !confirmPassword)
        return toast.error('Please fill all the fields');
      if (newPassword !== confirmPassword) return toast.error('Passwords do not match');
      const formData = new FormData();
      formData.append('oldPassword', oldPassword);
      formData.append('newPassword', newPassword);
      const response = await updateProfile({ userId: userId, formData }).unwrap();
      if (response?.success) {
        toast.success(response?.message);
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (error) {
      toast.error(error?.data?.message || 'Error while changing password');
      console.log('Error while changing password', error);
    }
  };
  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 gap-5 rounded-xl border border-gray-200 p-5"
    >
      <div className="relative">
        <Input
          label="Old Password"
          name="password"
          type={showOldPassword ? 'text' : 'password'}
          onChange={e => setOldPassword(e.target.value)}
        />
        <div
          className="absolute top-11.75 right-5 flex cursor-pointer items-center gap-2 text-sm text-[#666666CC] lg:text-lg"
          onClick={() => setShowOldPassword(!showOldPassword)}
        >
          {showOldPassword ? <IoEyeOutline /> : <IoEyeOffOutline />}
        </div>
      </div>
      <div className="relative">
        <Input
          label="New Password"
          name="password"
          type={showNewPassword ? 'text' : 'password'}
          onChange={e => setNewPassword(e.target.value)}
        />
        <div
          className="absolute top-11.75 right-5 flex cursor-pointer items-center gap-2 text-sm text-[#666666CC] lg:text-lg"
          onClick={() => setShowNewPassword(!showNewPassword)}
        >
          {showNewPassword ? <IoEyeOutline /> : <IoEyeOffOutline />}
        </div>
      </div>
      <div className="relative">
        <Input
          label="Confirm New Password"
          name="password"
          type={showConfirmPassword ? 'text' : 'password'}
          onChange={e => setConfirmPassword(e.target.value)}
        />
        <div
          className="absolute top-11.75 right-5 flex cursor-pointer items-center gap-2 text-sm text-[#666666CC] lg:text-lg"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
        >
          {showConfirmPassword ? <IoEyeOutline /> : <IoEyeOffOutline />}
        </div>
      </div>
      <div className="mt-3 flex items-center justify-end gap-4">
        {/* <button
          disabled={isLoading}
          type="submit"
          className="w-full cursor-pointer rounded bg-[#03A5E030] px-6 py-3 text-[14px] text-[#03A5E0] disabled:cursor-not-allowed disabled:opacity-20 md:w-auto"
        >
          Change Password
        </button> */}
        <Button text="Change Password" type="submit" disabled={isLoading} width="!w-[180px]" />
      </div>
    </form>
  );
};

export default ChangePassword;
