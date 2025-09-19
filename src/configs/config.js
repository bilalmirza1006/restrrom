const config = Object.freeze({
  // global credentials
  // ------------------
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV,
  MONGODB_URL: process.env.MONGODB_URL,
  DB_NAME: process.env.DB_NAME,
  RESET_PASSWORD_URL: process.env.RESET_PASSWORD_URL,

  // jwt token credentials
  // ---------------------
  ACCESS_TOKEN_EXPIRY_TIME: process.env.ACCESS_TOKEN_EXPIRY_TIME,
  ACCESS_TOKEN_MAX_AGE: process.env.ACCESS_TOKEN_MAX_AGE,
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
  ACCESS_TOKEN_NAME: process.env.ACCESS_TOKEN_NAME,
  REFRESH_TOKEN_EXPIRY_TIME: process.env.REFRESH_TOKEN_EXPIRY_TIME,
  REFRESH_TOKEN_MAX_AGE: process.env.REFRESH_TOKEN_MAX_AGE,
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
  REFRESH_TOKEN_NAME: process.env.REFRESH_TOKEN_NAME,
  VERIFICATION_TOKEN_SECRET: process.env.VERIFICATION_TOKEN_SECRET,
  VERIFICATION_TOKEN_EXPIRY_TIME: process.env.VERIFICATION_TOKEN_EXPIRY_TIME,

  // cloudinary credentials
  // ---------------------
  CLOUDINARY_CLIENT_KEY: process.env.CLOUDINARY_CLIENT_KEY,
  CLOUDINARY_CLIENT_NAME: process.env.CLOUDINARY_CLIENT_NAME,
  CLOUDINARY_CLIENT_SECRET: process.env.CLOUDINARY_CLIENT_SECRET,
  CLOUDINARY_FOLDER_NAME: process.env.CLOUDINARY_FOLDER_NAME,

  //nodemailer configs
  // -----------------
  NODEMAILER_FROM: process.env.NODEMAILER_FROM,
  NODEMAILER_HOST: process.env.NODEMAILER_HOST,
  NODEMAILER_PASSWORD: process.env.NODEMAILER_PASSWORD,
  NODEMAILER_PORT: process.env.NODEMAILER_PORT,
  NODEMAILER_USER: process.env.NODEMAILER_USER,

  // SQL database configs
  // -------------------
  SQL_DB_NAME: process.env.SQL_DB_NAME,
  SQL_USERNAME: process.env.SQL_USERNAME,
  SQL_PASSWORD: process.env.SQL_PASSWORD,
  SQL_HOST_NAME: process.env.SQL_HOST_NAME,
  SQL_PORT: process.env.SQL_PORT,

  // Stripe configs
  // --------------
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
  SUBSCRIPTION_TRIAL_PERIOD_DAYS: process.env.SUBSCRIPTION_TRIAL_PERIOD_DAYS,
  SUBSCRIPTION_SUCCESS_URL: process.env.SUBSCRIPTION_SUCCESS_URL,
  SUBSCRIPTION_CANCEL_URL: process.env.SUBSCRIPTION_CANCEL_URL,
  SUBSCRIPTION_RETURN_URL: process.env.SUBSCRIPTION_RETURN_URL,
});

const getEnv = (key) => {
  const value = config[key];
  if (!value) throw new Error(`Config ${key} not found`);
  return value;
};

export { getEnv };
