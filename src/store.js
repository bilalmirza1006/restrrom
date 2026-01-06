'use client';
const { configureStore } = require('@reduxjs/toolkit');
const { authApi } = require('./features/auth/authApi');
import { Provider } from 'react-redux';
import { sensorApi } from './features/sensor/sensorApi';
import authSlice from './features/auth/authSlice';
import buildingSlice from './features/building/buildingSlice';
import { buildingApis } from './features/building/buildingApi';
import { restroomApis } from './features/restroom/restroomApi';
import { inspectionApis } from './features/inspection/inspectionApi';
import { subscriptionApis } from './features/subscription/subscriptionApi';
import { superAdminApis } from './features/superAdmin/superAdminApi';
import { alertsApi } from './features/alerts/alertsApi';
import { ruleEngineApi } from './features/ruleEngine/ruleEngine';
import { reportsApi } from './features/reports/reportsApi';
import { adminApi } from './features/admin/adminApi';

const store = configureStore({
  reducer: {
    [authSlice.name]: authSlice.reducer,
    [buildingSlice.name]: buildingSlice.reducer,
    [buildingApis.reducerPath]: buildingApis.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [sensorApi.reducerPath]: sensorApi.reducer,
    [restroomApis.reducerPath]: restroomApis.reducer,
    [inspectionApis.reducerPath]: inspectionApis.reducer,
    [subscriptionApis.reducerPath]: subscriptionApis.reducer,
    [superAdminApis.reducerPath]: superAdminApis.reducer,
    [alertsApi.reducerPath]: alertsApi.reducer,
    [ruleEngineApi.reducerPath]: ruleEngineApi.reducer,
    [reportsApi.reducerPath]: reportsApi.reducer,
    [adminApi.reducerPath]: adminApi.reducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({ serializableCheck: false })
      .concat(authApi.middleware)
      .concat(sensorApi.middleware)
      .concat(buildingApis.middleware)
      .concat(restroomApis.middleware)
      .concat(inspectionApis.middleware)
      .concat(subscriptionApis.middleware)
      .concat(superAdminApis.middleware)
      .concat(alertsApi.middleware)
      .concat(ruleEngineApi.middleware)
      .concat(reportsApi.middleware)
      .concat(adminApi.middleware),
});

const StoreProvider = ({ children }) => {
  return <Provider store={store}>{children}</Provider>;
};

export { StoreProvider };
