// app/login/page.js - UPDATED (No token handling needed)
'use client';

import { useState, useEffect } from 'react';
import { IoEyeOffOutline, IoEyeOutline } from 'react-icons/io5';
import Input from '../global/small/Input';
import Button from '../global/small/Button';
import Link from 'next/link';
import { useLoginMutation } from '@/features/auth/authApi';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { setUser } from '@/features/auth/authSlice';

const LoginForm = () => {
  const [login, { isLoading, isError }] = useLoginMutation();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector(state => state.auth);

  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [userRole, setUserRole] = useState(null);
  const [loginSuccess, setLoginSuccess] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  // Handle input changes
  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Separate useEffect for handling redirection after successful login
  // In your login form - UPDATE THE REDIRECTION LOGIC
  useEffect(() => {
    if (loginSuccess && userRole) {
      console.log('🔄 LOGIN FORM: Starting redirection process for role:', userRole);

      // Direct redirection based on role
      const roleRedirects = {
        super_admin: '/super-admin',
        building_inspector: '/inspectionist',
        admin: '/admin',
        reporter_manager: '/admin',
        subscription_manager: '/admin',
        building_manager: '/admin',
      };

      const redirectPath = roleRedirects[userRole] || '/admin';

      console.log('🎯 LOGIN FORM: REDIRECTING TO:', redirectPath, 'FOR ROLE:', userRole);

      // Immediate redirect without delay
      console.log('🚀 LOGIN FORM: Executing redirect to', redirectPath);
      router.push(redirectPath);

      // Reset login success state
      setLoginSuccess(false);
    }
  }, [loginSuccess, userRole, router]);
  // Handle form submission
  const handleForm = async e => {
    e.preventDefault();

    if (!formData.email || !formData.password)
      return toast.error('Please provide email and password');

    try {
      console.log('📤 LOGIN FORM: Attempting login with:', formData.email);
      const res = await login(formData).unwrap();

      // Log the entire response for debugging
      console.log('✅ LOGIN FORM: Full login response:', JSON.stringify(res, null, 2));

      if (res?.success) {
        const { data } = res; // No token in response - it's in cookies

        // Debug the data structure in more detail
        console.log('📊 LOGIN FORM: Login response data:', data);
        if (data) {
          console.log('🔍 LOGIN FORM: Data properties:', Object.keys(data));
          console.log('🎭 LOGIN FORM: Data role:', data.role);
          console.log('👤 LOGIN FORM: Full user data:', data);
        }

        // Dispatch user data to Redux
        if (data && data.role) {
          // Ensure data and data.role exist
          dispatch(setUser(data));

          toast.success(res?.message || 'User logged in successfully');

          // Set role and login success state for redirection
          console.log('🎯 LOGIN FORM: Setting user role for redirect:', data.role);
          setUserRole(data.role);
          setLoginSuccess(true);
        } else {
          console.error('❌ LOGIN FORM: Data or data.role is missing in response', data);
          toast.error(
            'Login successful but user data is incomplete or role is missing. Please contact support.'
          );
        }
      } else {
        console.error('❌ LOGIN FORM: Login response indicates failure:', res);
        toast.error(res?.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('💥 LOGIN FORM: Login error:', error);
      toast.error(error?.data?.message || 'Something went wrong during login.');
    }
  };

  return (
    <form className="w-full rounded-xl bg-white p-5 lg:px-[8%] lg:py-8" onSubmit={handleForm}>
      <h6 className="text-text-textColor text-center text-xl font-semibold md:text-left lg:text-2xl">
        Login now
      </h6>
      <div className="mt-5 grid grid-cols-1 gap-4 md:gap-6 lg:mt-7">
        <div>
          <Input
            label="Email address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="relative">
          <Input
            label="Password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleInputChange}
            autoComplete="current-password"
            required
          />
          <div
            className="absolute top-0 right-3 flex cursor-pointer items-center gap-2 text-sm text-[#666666CC] lg:text-lg"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
          </div>
        </div>
        <Button
          text={isLoading ? 'Logging in...' : 'Login'}
          type="submit"
          disabled={isLoading}
          cn={`${isLoading && 'opacity-60 cursor-not-allowed'}`}
        />
        <div className="text-sm text-[#666666] lg:text-base">
          Don't have an account?{' '}
          <Link href="/signup" className="text-primary font-semibold">
            Signup
          </Link>
        </div>
      </div>
    </form>
  );
};

export default LoginForm;
