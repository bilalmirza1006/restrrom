'use client';
import { useState, useEffect } from 'react';
import Button from '@/components/global/small/Button';
import Input from '@/components/global/small/Input';
import { useGetProfileQuery, useUpdateProfileMutation } from '@/features/auth/authApi';
import toast from 'react-hot-toast';
import Loader from '@/components/global/Loader';
import { useSelector } from 'react-redux';

const Profile = () => {
  const { user } = useSelector(state => state.auth);
  const userId = user?.user?._id;

  const { data, isLoading } = useGetProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();

  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    if (data?.data) {
      setProfile(data.data);

      setFormData({
        fullName: data.data.fullName || '',
        email: data.data.email || '',
        phoneNumber: data.data.phoneNumber || '',
        dob: data.data.dob?.substring(0, 10) || '',
        nationality: data.data.nationality || '',
      });
    }
  }, [data]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageSelect = e => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleToggleEdit = async () => {
    if (isEditing) {
      try {
        const form = new FormData();

        // append text fields
        Object.entries(formData).forEach(([key, value]) => {
          form.append(key, value);
        });

        // append image
        if (selectedImage) {
          form.append('image', selectedImage);
        }

        // IMPORTANT FIX — use correct keys: { userId, formData: form }
        const res = await updateProfile({
          userId: userId,
          formData: form,
        }).unwrap();

        toast.success(res.message || 'Profile updated successfully');

        // Update UI
        setProfile(res.user);
        setPreviewImage(null);
        setSelectedImage(null);
      } catch (err) {
        toast.error(err?.data?.message || 'Failed to update profile');
      }
    }

    setIsEditing(prev => !prev);
  };

  const ProfileField = ({ label, value }) => (
    <div className="mb-4">
      <label className="mb-1 block font-medium text-gray-600">{label}</label>
      <div className="rounded-md bg-gray-200 p-2 text-gray-800">{value || '—'}</div>
    </div>
  );

  if (isLoading || !profile) return <Loader />;
  const imageUrl = profile.image?.url?.startsWith('http')
    ? profile.image.url
    : `${process?.env?.NEXT_PUBLIC_BASE_URL}${profile?.image?.url}`;
  console.log('imageUrlimageUrlimageUrl', imageUrl);

  return (
    <div className="flex justify-center">
      <div className="w-full rounded-xl bg-white p-6 shadow">
        <div className="flex flex-col items-center">
          <img
            src={previewImage || profile?.image?.url || '/images/default/profile.png'}
            alt={formData.fullName}
            className="mb-4 size-32 rounded-full object-cover shadow md:size-52"
          />

          {isEditing && (
            <div className="mb-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="border-primary text-primary cursor-pointer rounded-lg border p-2"
              />
            </div>
          )}

          <h2 className="mb-2 text-2xl font-bold">{formData.fullName}</h2>
        </div>

        <div className="mt-6">
          {isEditing ? (
            <form className="space-y-4">
              <Input
                label="Full Name"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
              />

              <Input
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />

              <Input
                label="Phone Number"
                name="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={handleChange}
              />

              <Input
                label="Date of Birth"
                name="dob"
                type="date"
                value={formData.dob}
                onChange={handleChange}
              />

              <Input
                label="Nationality"
                name="nationality"
                value={formData.nationality}
                onChange={handleChange}
              />
            </form>
          ) : (
            <div className="space-y-4">
              <ProfileField label="Email" value={profile.email} />
              <ProfileField label="Phone Number" value={profile.phoneNumber} />
              <ProfileField label="Date of Birth" value={profile.dob} />
              <ProfileField label="Nationality" value={profile.nationality} />
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            onClick={handleToggleEdit}
            width="max-w-[130px]"
            text={isEditing ? (isUpdating ? 'Saving...' : 'Save') : 'Edit Profile'}
          />
        </div>
      </div>
    </div>
  );
};

export default Profile;
