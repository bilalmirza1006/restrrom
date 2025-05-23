"use client";
const { configureStore } = require("@reduxjs/toolkit");
const { authApi } = require("./features/auth/authApi");
import { Provider } from "react-redux";
import { sensorApi } from "./features/sensor/sensorApi";
import authSlice from "./features/auth/authSlice";
import buildingSlice from "./features/building/buildingSlice";
import { buildingApis } from "./features/building/buildingApi";
import { restroomApis } from "./features/restroom/restroomApi";
import { inspectionApis } from "./features/inspection/inspectionApi";

const store = configureStore({
  reducer: {
    [authSlice.name]: authSlice.reducer,
    [buildingSlice.name]: buildingSlice.reducer,
    [buildingApis.reducerPath]: buildingApis.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [sensorApi.reducerPath]: sensorApi.reducer,
    [restroomApis.reducerPath]: restroomApis.reducer,
    [inspectionApis.reducerPath]: inspectionApis.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false })
      .concat(authApi.middleware)
      .concat(sensorApi.middleware)
      .concat(buildingApis.middleware)
      .concat(restroomApis.middleware)
      .concat(inspectionApis.middleware),
});

const StoreProvider = ({ children }) => {
  return <Provider store={store}>{children}</Provider>;
};

export { StoreProvider };
