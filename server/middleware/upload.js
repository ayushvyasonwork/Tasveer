import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { cloudinary } from "../config/cloudinary.js"; // adjust import

// Multer storage with unique ID + extension
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/assets");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = uuidv4() + ext; // e.g. "a8c3f1b0-9e3f-4c12-b5a0.png"
    cb(null, uniqueName);
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (![".png", ".jpg", ".jpeg", ".gif", ".webp"].includes(ext)) {
    return cb(new Error("Only image files are allowed!"), false);
  }
  cb(null, true);
};

// Multer upload instance
const upload = multer({ storage, fileFilter });

// Custom middleware with Cloudinary + Redis
export const uploadWithCheck = (req, res, next) => {
  const singleUpload = upload.single("picture");

  singleUpload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ message: "No image file uploaded" });
    }

    const filePath = `public/assets/${req.file.filename}`;
    if (!fs.existsSync(filePath)) {
      return res.status(500).json({ message: "Image upload failed" });
    }

    // ✅ Async upload to Cloudinary
    (async () => {
      try {
        const uploadResult = await cloudinary.uploader.upload(filePath, {
          folder: "social_app",
          resource_type: "image",
          public_id: path.parse(req.file.filename).name, // use unique id (without ext)
        });

        // Invalidate caches
        await req.redisClient.del("stories");
        await req.redisClient.del("posts");

        // Save mapping in Redis (local filename → Cloudinary URL)
        await req.redisClient.setEx(
          `image:${req.file.filename}`,
          24 * 60 * 60, // 1 day
          uploadResult.secure_url
        );

        console.log("✅ Uploaded to Cloudinary:", uploadResult.secure_url);
      } catch (cloudErr) {
        console.error("❌ Cloudinary upload failed:", cloudErr.message);
      }
    })();

    // Continue to controller
    next();
  });
};
