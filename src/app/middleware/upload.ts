import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter: multer.Options["fileFilter"] = (req, file, cb) => {
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, PNG and WEBP images are allowed"));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

const csvFileFilter: multer.Options["fileFilter"] = (req, file, cb) => {
  const allowedMimeTypes = ["text/csv", "application/vnd.ms-excel", "application/octet-stream"];
  const allowedExtensions = [".csv"];
  
  const isCsvMime = allowedMimeTypes.includes(file.mimetype);
  const isCsvExt = allowedExtensions.some(ext => file.originalname.toLowerCase().endsWith(ext));

  if (isCsvMime || isCsvExt) {
    cb(null, true);
  } else {
    cb(new Error("Only CSV files are allowed"));
  }
};

export const uploadCSV = multer({
  storage,
  fileFilter: csvFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});