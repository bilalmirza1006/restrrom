"use client";
const { configureStore } = require("@reduxjs/toolkit");
const { authApi } = require("./features/auth/authApi");
import { Provider } from "react-redux";
import { sensorApi } from "./features/sensor/sensorApi";
import authSlice from "./features/auth/authSlice";
import buildingSlice from "./features/building/buildingSlice";

const store = configureStore({
  reducer: {
    [authSlice.name]: authSlice.reducer,
    [buildingSlice.name]: buildingSlice.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [sensorApi.reducerPath]: sensorApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authApi.middleware)
      .concat(sensorApi.middleware),
});

const StoreProvider = ({ children }) => {
  return <Provider store={store}>{children}</Provider>;
};

export { StoreProvider };
