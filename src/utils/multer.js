require("dotenv").config();
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "marmaAdminPanel",
    allowedFormats: ["pdf", "docx", "jpeg", "png", "jpg", "svg", "gif", "mp4", "webm"],
    resource_type: "raw", // Set resource_type as "raw" for all files
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 24 * 1024 * 1024, // 24 MB file size limit
  },
});


// Custom error handling middleware for upload errors
const handleUploadError = (err, res, next) => {
  if (err && err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ message: "File size should not exceed 24MB!" });
  }
  next(err);
};

module.exports = {
  upload,
  handleUploadError,
};

