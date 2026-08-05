import admin from "firebase-admin";
import path from "path";
import fs from "fs";

let serviceAccount: any = null;

// 1. Try to load from environment variable first (best practice for production/docker containers)
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } catch (error) {
    console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT environment variable:", error);
  }
}

// 2. Try loading from file paths if env var is not set or failed to parse
if (!serviceAccount) {
  const possiblePaths = [
    path.join(__dirname, "firebase-service-account.json"), // dist/app/config/ or src/app/config/
    path.join(process.cwd(), "src", "app", "config", "firebase-service-account.json"), // fallback relative to project root
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      try {
        serviceAccount = require(p);
        break;
      } catch (error) {
        console.error(`Failed to load Firebase service account from ${p}:`, error);
      }
    }
  }
}

if (!serviceAccount) {
  throw new Error(
    "Firebase service account credentials not found. Please provide them via the FIREBASE_SERVICE_ACCOUNT environment variable (JSON string) or place the credential file at src/app/config/firebase-service-account.json."
  );
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });
}

export const fcm = admin.messaging();
