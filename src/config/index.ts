import env from "./env";

export default {
  isDev: env.NODE_ENV === "development",
  isProd: env.NODE_ENV === "production",
  auth: {
    secretKey: env.JWT_SECRET_KEY,
    tokenExpiration: env.TOKEN_EXPIRATION,
    refreshTokenExpiration: env.REFRESH_TOKEN_EXPIRATION,
    otpExpirationMinutes: env.OTP_EXPIRATION_MINUTES,
  },
};
