import createToken from "./createJwtToken";

export  const createAuthTokens = (user: {
  id: string;
  email: string;
  role: string;
}) => {
  const jwtPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = createToken(
    jwtPayload,
    process.env.JWT_ACCESS_SECRET as string,
    process.env.JWT_ACCESS_EXPIRES_IN || "15m"
  );

  const refreshToken = createToken(
    jwtPayload,
    process.env.JWT_REFRESH_SECRET as string,
    process.env.JWT_REFRESH_EXPIRES_IN || "7d"
  );

  return {
    accessToken,
    refreshToken,
  };
};
