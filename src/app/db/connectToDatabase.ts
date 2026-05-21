import { prisma } from "../lib/prisma";

export const connectToDatabase = async () => {
  try {
    await prisma.$connect();
    console.log("Database connection successful");
  } catch (error: any) {
    console.log("Database connection error", error);
    process.exit(1);
  }
};