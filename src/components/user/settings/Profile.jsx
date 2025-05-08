"use client";
import { useState, useEffect } from "react";
import Button from "@/components/global/small/Button";
import Input from "@/components/global/small/Input";
import {
  useGetProfileQuery,
  useUpdateProfileMutation,
} from "@/features/auth/authApi";
import toast from "react-hot-toast";
import Loader from "@/components/global/Loader";

const Profile = () => {
  const { data, isLoading } = useGetProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();

  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    if (data?.user) {
      setProfile(data.user);
      setFormData({
        fullName: data.user.fullName || "",
        email: data.user.email || "",
        phoneNumber: data.user.phoneNumber || "",
        dob: data.user.dob?.substring(0, 10) || "",
        nationality: data.user.nationality || "",
      });
    }
  }, [data]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageSelect = (e) => {
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
        Object.entries(formData).forEach(([key, value]) => {
          form.append(key, value);
        });

        if (selectedImage) {
          form.append("image", selectedImage);
        }

        const res = await updateProfile(form).unwrap();
        toast.success(res.message || "Profile updated successfully");
        setProfile(res.user);
        setPreviewImage(null);
        setSelectedImage(null);
      } catch (err) {
        console.error("Failed to update profile:", err);
        toast.error(err?.data?.message || "Failed to update profile");
      }
    }
    setIsEditing((prev) => !prev);
  };

  const ProfileField = ({ label, value }) => (
    <div className="mb-4">
      <label className="block text-gray-600 font-medium mb-1">{label}</label>
      <div className="text-gray-800">{value || "—"}</div>
    </div>
  );

  if (isLoading || !profile) return <Loader />;

  return (
    <div className="flex justify-center">
      <div className="w-full bg-white shadow rounded-xl p-6">
        <div className="flex flex-col items-center">
          <img
            src={
              previewImage ||
              profile?.image?.url ||
              "/images/default/profile.png"
            }
            alt={formData.fullName}
            className="size-32 md:size-52 rounded-full mb-4 object-cover shadow"
          />
          {isEditing && (
            <div className="mb-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="border border-primary text-primary rounded-lg p-2 cursor-pointer"
              />
            </div>
          )}
          <h2 className="text-2xl font-bold mb-2">{formData.fullName}</h2>
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
            text={
              isEditing ? (isUpdating ? "Saving..." : "Save") : "Edit Profile"
            }
          />
        </div>
      </div>
    </div>
  );
};

export default Profile;
