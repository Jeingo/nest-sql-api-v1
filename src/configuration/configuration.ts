export default (): IConfigType => ({
  MONGO_URL: process.env.MONGO_URL || 'mongodb://127.0.0.1:27017',
  DB_NAME: process.env.DB_NAME || 'service',
  port: parseInt(process.env.PORT, 10) || 5000,
  BASIC_AUTH_LOGIN: process.env.BASIC_AUTH_LOGIN,
  BASIC_AUTH_PASSWORD: process.env.BASIC_AUTH_PASSWORD,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  EXPIRE_JWT: process.env.EXPIRE_JWT,
  EXPIRE_REFRESH_JWT: process.env.EXPIRE_REFRESH_JWT,
  secureCookieMode: process.env.SECURE_COOKIE_MODE == 'true',
  EMAIL_LOGIN: process.env.EMAIL_LOGIN,
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
  throttleLimit: parseInt(process.env.THROTTLE_LIMIT, 10),
  throttleTtl: parseInt(process.env.THROTTLE_TTL, 10)
});

export type IConfigType = {
  MONGO_URL: string;
  DB_NAME: string;
  port: number;
  BASIC_AUTH_LOGIN: string;
  BASIC_AUTH_PASSWORD: string;
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;
  EXPIRE_JWT: string;
  EXPIRE_REFRESH_JWT: string;
  secureCookieMode: boolean;
  EMAIL_LOGIN: string;
  EMAIL_PASSWORD: string;
  throttleLimit: number;
  throttleTtl: number;
};
