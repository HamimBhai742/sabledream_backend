import { prisma } from "../lib/prisma";

export const connectToDatabase = async () => {
  try {
    await prisma.$connect();
  } catch (error: any) {
    console.error("Database connection error", error);
    process.exit(1);
  }
};