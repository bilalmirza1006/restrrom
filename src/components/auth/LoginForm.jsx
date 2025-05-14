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
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  console.log('login user', user);

  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [userRole, setUserRole] = useState(null);
  const [loginSuccess, setLoginSuccess] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Separate useEffect for handling redirection after successful login
  useEffect(() => {
    if (loginSuccess && userRole) {
      let redirectPath = '/'; // Default path for any unspecified role

      // Determine redirect path based on role
      if (userRole === 'admin') {
        redirectPath = '/admin';
      } else if (userRole === 'inspector') {
        redirectPath = '/inspectionist';
      } else if (userRole === 'user') {
        redirectPath = '/user'; // Changed from '/' to '/user'
      }

      console.log('LOGIN FORM: REDIRECTING TO:', redirectPath, 'ROLE:', userRole);

      // Force redirect with a slight delay to ensure state updates are complete
      const timer = setTimeout(() => {
        // router.push() is generally preferred in Next.js for client-side navigation
        router.push(redirectPath);
      }, 100); // Reduced delay as state updates should be quick here

      return () => clearTimeout(timer);
    }
  }, [loginSuccess, userRole, router]);

  // Handle form submission
  const handleForm = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password)
      return toast.error('Please provide email and password');

    try {
      const res = await login(formData).unwrap();

      // Log the entire response for debugging
      console.log('LOGIN FORM: Full login response:', JSON.stringify(res));

      if (res?.success) {
        const { data } = res;

        // Debug the data structure in more detail
        console.log('LOGIN FORM: Login response data:', data);
        if (data) {
          console.log('LOGIN FORM: Data properties:', Object.keys(data));
          console.log('LOGIN FORM: Data role:', data.role);
        }

        // Dispatch user data to Redux
        if (data && data.role) {
          // Ensure data and data.role exist
          dispatch(setUser(data));
          toast.success(res?.message || 'User logged in successfully');

          // Set role and login success state for redirection
          setUserRole(data.role);
          setLoginSuccess(true);
        } else {
          console.error('LOGIN FORM: Data or data.role is missing in response', data);
          toast.error(
            'Login successful but user data is incomplete or role is missing. Please contact support.'
          );
        }
      }
    } catch (error) {
      console.error('LOGIN FORM: Login error:', error);
      toast.error(error?.data?.message || 'Something went wrong during login.');
    }
  };

  return (
    <form className="bg-white p-5 lg:py-8 lg:px-[8%] rounded-xl w-full" onSubmit={handleForm}>
      <h6 className="text-center md:text-left text-xl lg:text-2xl font-semibold text-text-textColor">
        Login now
      </h6>
      <div className="mt-5 lg:mt-7 grid grid-cols-1 gap-4 md:gap-6">
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
            {showPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
          </div>
        </div>
        <Button
          text="Login"
          type="submit"
          disabled={isLoading}
          cn={`${isLoading && 'opacity-60 cursor-not-allowed'}`}
        />
        <div className="text-sm lg:text-base text-[#666666]">
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
