import httpStatus from "http-status";
import AppError from "../../error/AppError";
import { prisma } from "../../lib/prisma";
import bcrypt from "bcryptjs";
import { deleteFromCloudinary, uploadBufferToCloudinary } from "../../utils/uploadCloudinary";
import { changePasswordSuccessTemplate } from "../../utils/emailTemplates/changePasswordSuccess";
import { getDeviceInfo } from "../../utils/deviceParser";
import { deleteAccountPermanentTemplate } from "../../utils/emailTemplates/deleteAccount";

const updateProfile = async (
  userId: string,
  data: any,
  file?: Express.Multer.File
) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  // Parse data if it is sent as stringified JSON (common in multipart form-data)
  const updateData = typeof data.data === "string" ? JSON.parse(data.data) : data;

  // Validate email uniqueness if email is being updated
  if (updateData.email && updateData.email !== user.email) {
    const existingEmailUser = await prisma.user.findUnique({
      where: { email: updateData.email },
    });

    if (existingEmailUser) {
      throw new AppError(
        httpStatus.CONFLICT,
        "Email is already taken by another account"
      );
    }
  }

  let imageUrl = user.image;

  // Handle profile image upload
  if (file) {
    // If the user already had an uploaded image on Cloudinary, delete it first
    // Cloudinary public_ids are usually returned as part of the image URL or stored.
    // Since we only store the secure_url in `image`, let's try to extract the public_id from it
    if (user.image && user.image.includes("cloudinary.com")) {
      try {
        const parts = user.image.split("/");
        const filename = parts[parts.length - 1];
        const publicId = filename.split(".")[0];
        // Clean up the old image
        await deleteFromCloudinary(`profile_pictures/${publicId}`);
      } catch (err) {
        console.error("Failed to delete old profile image:", err);
      }
    }

    // Upload new image
    const uploadResult = await uploadBufferToCloudinary(file.buffer, "profile_pictures");
    imageUrl = uploadResult.secure_url;
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      name: updateData.name,
      email: updateData.email,
      location: updateData.location,
      phone: updateData.phone,
      image: imageUrl,
      fcmToken: updateData.fcmToken,
    },
  });

  // Exclude password from the returned object for security
  const { password, ...userWithoutPassword } = updatedUser;

  return userWithoutPassword;
};

const changePassword = async (
  userId: string,
  data: any,
  clientInfo?: { ipAddress?: string; userAgent?: string }
) => {
  const { oldPassword, newPassword } = data;

  if (!oldPassword || !newPassword) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Both old password and new password are required"
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  // If user signed up via social login (Google/Apple) and hasn't set a password yet
  if (!user.password) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "This account was created via social login and does not have a password. Please log in using Google or Apple."
    );
  }

  // Compare old password with the hashed password in database
  const isPasswordMatched = await bcrypt.compare(oldPassword, user.password);

  if (!isPasswordMatched) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "Old password does not match"
    );
  }

  // Hash new password and update
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: userId },
    data: {
      password: hashedPassword,
    },
  });

  const device = getDeviceInfo(clientInfo?.userAgent);

  await changePasswordSuccessTemplate({
    userName: user.name,
    email: user.email,
    changedAt: new Date().toLocaleString("en-US", {
      timeZone: "America/New_York",
      year: "numeric",
      month: "long",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }),
    ipAddress: clientInfo?.ipAddress,
    device,
  });

  return { message: "Password changed successfully" };
};

const downloadMyData = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      journals: true,
      moods: true,
      manifestations: true,
    },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  // Exclude sensitive information like passwords and private session tokens
  const {
    password,
    forgetPasswordToken,
    forgetPasswordTokenExpires,
    otp,
    otpExpiry,
    ...safeUserData
  } = user;

  return safeUserData;
};

const deleteAccount = async (
  userId: string,
  clientInfo?: { ipAddress?: string; userAgent?: string }
) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      journals: true,
      manifestations: true,
    },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  // Extract user details before deleting the record
  const userName = user.name;
  const email = user.email;

  // 1. Delete user's profile image from Cloudinary if it exists
  if (user.image && user.image.includes("cloudinary.com")) {
    try {
      const parts = user.image.split("/");
      const filename = parts[parts.length - 1];
      const publicId = filename.split(".")[0];
      await deleteFromCloudinary(`profile_pictures/${publicId}`);
    } catch (err) {
      console.error("Failed to delete user profile picture from Cloudinary:", err);
    }
  }

  // 2. Delete all manifestation images from Cloudinary
  for (const manifestation of user.manifestations) {
    if (manifestation.imageKey) {
      try {
        await deleteFromCloudinary(manifestation.imageKey);
      } catch (err) {
        console.error(`Failed to delete manifestation image ${manifestation.imageKey}:`, err);
      }
    }
  }

  // 3. Delete all journal images from Cloudinary
  for (const journal of user.journals) {
    if (journal.imageKey) {
      try {
        await deleteFromCloudinary(journal.imageKey);
      } catch (err) {
        console.error(`Failed to delete journal image ${journal.imageKey}:`, err);
      }
    }
  }

  // 4. Delete the User. Cascade delete automatically deletes moods, manifestations, and journals in MongoDB.
  await prisma.user.delete({
    where: { id: userId },
  });

  // 5. Send confirmation email
  try {
    const device = getDeviceInfo(clientInfo?.userAgent);
    const deletedAt = new Date().toLocaleString("en-US", {
      timeZone: "America/New_York",
      year: "numeric",
      month: "long",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

    await deleteAccountPermanentTemplate({
      userName,
      email,
      deletedAt,
      ipAddress: clientInfo?.ipAddress,
      device,
    });
  } catch (err) {
    console.error("Failed to send delete account confirmation email:", err);
  }

  return { message: "Account and all associated data deleted successfully" };
};

const updatePrivacySettings = async (
  userId: string,
  data: {
    personalizationEnabled?: boolean;
    analyticsEnabled?: boolean;
    crashReportsEnabled?: boolean;
  }
) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      personalizationEnabled: data.personalizationEnabled,
      analyticsEnabled: data.analyticsEnabled,
      crashReportsEnabled: data.crashReportsEnabled,
    },
  });

  const { password, ...userWithoutPassword } = updatedUser;
  return userWithoutPassword;
};

const updateFcmToken = async (userId: string, fcmToken: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      fcmToken,
    },
  });

  const { password, ...userWithoutPassword } = updatedUser;
  return userWithoutPassword;
};

const deleteProfileImage = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  // If the user has an uploaded image on Cloudinary, delete it
  if (user.image && user.image.includes("cloudinary.com")) {
    try {
      const parts = user.image.split("/");
      const filename = parts[parts.length - 1];
      const publicId = filename.split(".")[0];
      await deleteFromCloudinary(`profile_pictures/${publicId}`);
    } catch (err) {
      console.error("Failed to delete profile image from Cloudinary:", err);
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      image: null,
    },
  });

  const { password, ...userWithoutPassword } = updatedUser;
  return userWithoutPassword;
};

export const UserService = {
  updateProfile,
  changePassword,
  downloadMyData,
  deleteAccount,
  updatePrivacySettings,
  updateFcmToken,
  deleteProfileImage,
};


