import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { cloudinary } from "../config/cloudinary.js";

// Multer memory storage (no local saving)
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (![".png", ".jpg", ".jpeg", ".gif", ".webp"].includes(ext)) {
    return cb(new Error("Only image files are allowed!"), false);
  }
  cb(null, true);
};

const upload = multer({ storage, fileFilter });

// Middleware → upload to Cloudinary immediately
export const uploadWithCheck = (req, res, next) => {
  console.log("entered upload with check middleware");
  const singleUpload = upload.single("picture");

  singleUpload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No image file uploaded" });
    }

    try {
      // Upload to Cloudinary directly from buffer
      const uploadResult = cloudinary.uploader.upload_stream(
        {
          folder: "social_app",
          resource_type: "image",
          public_id: uuidv4(),
        },
        async (error, result) => {
          if (error) {
            console.error("❌ Cloudinary upload failed:", error.message);
            return res.status(500).json({ message: "Cloudinary upload failed" });
          }

          // ✅ Save Cloudinary URL in Redis
          await req.redisClient.setEx(
            `image:${result.public_id}`,
            24 * 60 * 60, // 1 day
            result.secure_url
          );
          // Attach Cloudinary info to req
          req.cloudinaryImage = {
            public_id: result.public_id,
            url: result.secure_url,
          };
          console.log("✅ Image uploaded to Cloudinary");
          next();
        }
      );
      // Write buffer to stream
      uploadResult.end(req.file.buffer);
    } catch (uploadErr) {
      console.error("Upload middleware error:", uploadErr.message);
      return res.status(500).json({ message: "Image processing failed" });
    }
  });
};