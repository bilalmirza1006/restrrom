const { createSlice } = require('@reduxjs/toolkit');

const initialState = {
  user: null,
  isAuthenticated: false,
};

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
        } else {
          console.error('Invalid user payload format:', action.payload);
        }
      } else {
        console.warn('Received null/undefined user payload');
        state.user = null;
        state.isAuthenticated = false;
      }
    },
    deleteUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setUser, deleteUser } = authSlice.actions;
export default authSlice;
