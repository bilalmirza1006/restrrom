'use client';

import { useState, useEffect } from 'react';
import { IoEyeOffOutline, IoEyeOutline } from 'react-icons/io5';
import Input from '../global/small/Input';
import Button from '../global/small/Button';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useRegisterMutation } from '@/features/auth/authApi';
import { useDispatch } from 'react-redux';
import { setUser } from '@/features/auth/authSlice';
import { useRouter } from 'next/navigation';

const SignupForm = () => {
  const [register, { isLoading }] = useRegisterMutation();
  const dispatch = useDispatch();
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [userRole, setUserRole] = useState(null);
  const [signupSuccess, setSignupSuccess] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Separate useEffect for handling redirection after successful signup
  useEffect(() => {
    if (signupSuccess && userRole) {
      let redirectPath = '/';

      // Determine redirect path based on role
      if (userRole === 'admin') {
        redirectPath = '/admin';
      } else if (userRole === 'inspector') {
        redirectPath = '/inspectionist';
      }

      console.log('REDIRECTING TO:', redirectPath, 'ROLE:', userRole);

      // Force redirect with a slight delay to ensure state updates are complete
      const timer = setTimeout(() => {
        window.location.href = redirectPath; // Use direct location change as a fallback
        router.push(redirectPath);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [signupSuccess, userRole, router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const isFormValid =
    formData.fullName.trim() !== '' &&
    formData.email.trim() !== '' &&
    formData.password.trim() !== '' &&
    formData.confirmPassword.trim() !== '' &&
    formData.password === formData.confirmPassword;

  const handleForm = async (e) => {
    e.preventDefault();
    if (!isFormValid) return toast.error('Please fill all fields correctly');

    try {
      const res = await register(formData).unwrap();

      // Log the entire response for debugging
      console.log('Full signup response:', JSON.stringify(res));

      if (res?.success) {
        const { data } = res;

        // Debug the data structure in more detail
        console.log('Signup response data:', data);
        if (data) {
          console.log('Data properties:', Object.keys(data));
          console.log('Data role:', data.role);
        }

        // Dispatch user data to Redux
        if (data) {
          dispatch(setUser(data));
          toast.success(res?.message || 'User registered successfully');

          // Set role and signup success state for redirection
          setUserRole(data.role || 'user');
          setSignupSuccess(true);
        } else {
          console.error('Data is missing in response');
          toast.error('Registration successful but user data is incomplete');
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error?.data?.message || 'Something went wrong');
    }
  };

  return (
    <form className="bg-white p-5 lg:py-8 lg:px-[8%] rounded-xl w-full" onSubmit={handleForm}>
      <h6 className="text-center md:text-left text-xl lg:text-2xl font-semibold text-text-textColor">
        Sign up now
      </h6>
      <div className="mt-5 lg:mt-7 grid grid-cols-1 gap-4 md:gap-6">
        <div>
          <Input
            label="Full name"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <Input
            label="Email address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
          />
        </div>
        <div className="relative">
          <Input
            label="Password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleInputChange}
            autoComplete="new-password"
          />
          <div
            className="absolute top-0 right-3 flex items-center gap-2 cursor-pointer text-sm lg:text-lg text-[#666666CC]"
            onClick={() => setShowPassword(!showPassword)}
          >
            {!showPassword ? (
              <>
                <IoEyeOutline color="#666666CC" />
                Show
              </>
            ) : (
              <>
                <IoEyeOffOutline color="#666666CC" />
                Hide
              </>
            )}
          </div>
        </div>
        <div className="relative">
          <Input
            label="Confirm Password"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={handleInputChange}
            autoComplete="new-password"
          />
          <div
            className="absolute top-0 right-3 flex items-center gap-2 cursor-pointer text-sm lg:text-lg text-[#666666CC]"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {!showConfirmPassword ? (
              <>
                <IoEyeOutline color="#666666CC" />
                Show
              </>
            ) : (
              <>
                <IoEyeOffOutline color="#666666CC" />
                Hide
              </>
            )}
          </div>
        </div>
        <Button
          text="Sign up"
          type="submit"
          disabled={isLoading}
          cn={`${isLoading && 'opacity-60 cursor-not-allowed'}`}
        />
        <div className="text-sm lg:text-base text-[#666666]">
          Already have an Account?{' '}
          <Link href="/login" className="text-primary font-semibold">
            Login
          </Link>
        </div>
      </div>
    </form>
  );
};

export default SignupForm;
