// 'use client';
// import React, { useState } from 'react';
// import Input from '@/components/global/small/Input';
// import Button from '@/components/global/small/Button';
// import Dropdown from '@/components/global/small/Dropdown';
// import toast from 'react-hot-toast';
// import { useRegisterMutation } from '@/features/auth/authApi';

// function AddUsers({ onClose, data }) {
//   const [register, { isLoading }] = useRegisterMutation();

//   const [formData, setFormData] = useState({
//     fullName: '',
//     email: '',
//     password: '',
//     confirmPassword: '',
//     role: '', // ✅ Add role field
//   });

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({ ...formData, [name]: value });
//   };
//   console.log('formData', formData);

//   const handleRoleSelect = (selectedOption) => {
//     setFormData({ ...formData, role: selectedOption });
//   };

//   const handleAddUser = async (e) => {
//     e.preventDefault();

//     if (!formData.fullName || !formData.email || !formData.password)
//       return toast.error('All fields are required');

//     if (formData.password !== formData.confirmPassword)
//       return toast.error('Passwords do not match');

//     try {
//       const payload = {
//         fullName: formData.fullName,
//         email: formData.email,
//         password: formData.password,
//         creatorId: data?.data?._id, // ✅ add creatorId
//       };

//       if (formData.role) payload.role = formData.role; // ✅ include role only if exists

//       const res = await register(payload).unwrap();
//       toast.success(res?.message || 'User added successfully');
//       onClose?.();
//     } catch (err) {
//       toast.error(err?.data?.message || 'Failed to add user');
//     }
//   };

//   return (
//     <form onSubmit={handleAddUser} className="space-y-4">
//       <Input
//         label="Full Name"
//         name="fullName"
//         value={formData.fullName}
//         onChange={handleInputChange}
//       />
//       <Input label="Email" name="email" value={formData.email} onChange={handleInputChange} />
//       <Dropdown
//         label="Select Role"
//         defaultText="Select Role"
//         options={[
//           { option: 'Building Manager', value: 'building_manager' },
//           { option: 'Report Manager', value: 'report_manager' },
//           { option: 'Subscription Manager', value: 'subscription-manager' },
//           { option: 'Building Inspector', value: 'building_inspector' },
//         ]}
//         onSelect={(value) => {
//           console.log('Selected role:', value); // ✅ Debugging line
//           setFormData((prev) => ({ ...prev, role: value }));
//         }}
//       />

//       <Input
//         label="Password"
//         name="password"
//         type="password"
//         value={formData.password}
//         onChange={handleInputChange}
//       />
//       <Input
//         label="Confirm Password"
//         name="confirmPassword"
//         type="password"
//         value={formData.confirmPassword}
//         onChange={handleInputChange}
//       />
//       <Button
//         text={isLoading ? 'Adding...' : 'Add User'}
//         type="submit"
//         disabled={isLoading}
//         cn={`${isLoading && 'opacity-60 cursor-not-allowed'}`}
//       />
//     </form>
//   );
// }

// export default AddUsers;
// components/user/managers/AddUsers.js - Updated
'use client';
import React, { useState } from 'react';
import Input from '@/components/global/small/Input';
import Button from '@/components/global/small/Button';
import Dropdown from '@/components/global/small/Dropdown';
import toast from 'react-hot-toast';
import { useRegisterMutation } from '@/features/auth/authApi';

function AddUsers({ onClose, data }) {
  const [register, { isLoading }] = useRegisterMutation();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddUser = async (e) => {
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

  const roleOptions = [
    { option: 'Building Manager', value: 'building_manager' },
    { option: 'Report Manager', value: 'report_manager' },
    { option: 'Subscription Manager', value: 'subscription_manager' },
    { option: 'Building Inspector', value: 'building_inspector' },
    { option: 'User', value: 'user' },
  ];

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
        onSelect={(value) => setFormData((prev) => ({ ...prev, role: value }))}
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
