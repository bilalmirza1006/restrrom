const { createSlice } = require('@reduxjs/toolkit');

// Helper to safely access localStorage (avoids errors in SSR)
const getStoredAuth = () => {
  if (typeof window !== 'undefined') {
    try {
      const storedAuth = localStorage.getItem('auth');
      if (storedAuth) {
        return JSON.parse(storedAuth);
      }
    } catch (error) {
      console.error('Error retrieving auth from localStorage:', error);
    }
  }
  return { user: null, isAuthenticated: false };
};

// Initialize from localStorage if available
const initialState = getStoredAuth();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      // Add better null handling and debugging
      console.log('Setting user in Redux:', action.payload);

      // Handle different user data formats with null checks
      if (action.payload) {
        if (typeof action.payload === 'object') {
          // If payload has user property, it's from login/register
          if (action.payload.user) {
            state.user = action.payload;
          } else {
            // If payload is directly the user data (from profile API)
            state.user = {
              user: action.payload,
              role: action.payload.role,
            };
          }
          state.isAuthenticated = true;

          // Persist auth state to localStorage
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem('auth', JSON.stringify(state));
            } catch (error) {
              console.error('Error storing auth in localStorage:', error);
            }
          }
        } else {
          console.error('Invalid user payload format:', action.payload);
        }
      } else {
        console.warn('Received null/undefined user payload');
        state.user = null;
        state.isAuthenticated = false;

        // Clear localStorage on logout/null user
        if (typeof window !== 'undefined') {
          try {
            localStorage.removeItem('auth');
          } catch (error) {
            console.error('Error removing auth from localStorage:', error);
          }
        }
      }
    },
    deleteUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;

      // Clear localStorage on logout
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem('auth');
        } catch (error) {
          console.error('Error removing auth from localStorage:', error);
        }
      }
    },
  },
});

export const { setUser, deleteUser } = authSlice.actions;
export default authSlice;
