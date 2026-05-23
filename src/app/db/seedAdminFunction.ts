import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";

type TSeedAdminResult =
  | { status: "skipped"; reason: string }
  | { status: "exists"; adminId: string; email: string }
  | { status: "created"; adminId: string; email: string };

export const seedAdminFunction = async (): Promise<TSeedAdminResult> => {
  const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "";
  const name = (process.env.ADMIN_SEED_NAME || "Admin").trim() || "Admin";
  console.log(email, password);
  if (!email || !password) {
    return {
      status: "skipped",
      reason: "Missing ADMIN_SEED_EMAIL or ADMIN_SEED_PASSWORD",
    };
  }

  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, role: true },
  });

  if (existing) {
    if (existing.role !== "admin") {
      return {
        status: "skipped",
        reason: `User already exists but role is '${existing.role}' (not promoting automatically)`,
      };
    }

    return { status: "exists", adminId: existing.id, email: existing.email };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const created = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      provider: "EMAIL",
      role: "admin",
      status: "active",
      isVerified: true,
    },
    select: { id: true, email: true },
  });

  return { status: "created", adminId: created.id, email: created.email };
};
