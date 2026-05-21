import "dotenv/config";

export default {
  port: Number(process.env.PORT),
  jwt_access_secret: process.env.JWT_ACCESS_SECRET as string,
  jwt_access_expire:process.env.JWT_ACCESS_EXPIRES_IN as string,
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET as string,
  jwt_refresh_expire: process.env.JWT_REFRESH_EXPIRES_IN as string,
  cloudinary: {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
    api_key: process.env.CLOUDINARY_API_KEY as string,
    api_secret: process.env.CLOUDINARY_API_SECRET as string,
  },
};