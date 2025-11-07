import { getEnv } from '@/configs/config';
import { accessTokenOptions } from '@/configs/constants';

const sendResponse = (res, msg, data = '', accessToken = '') => {
  const obj = { success: true, message: msg };
  if (data) obj.data = data;
  const response = res.json(obj);
  if (accessToken)
    response.cookies.set(getEnv('ACCESS_TOKEN_NAME'), accessToken, accessTokenOptions);
  return response;
};

export default sendResponse;
