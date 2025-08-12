import multer from "multer";
import path from "path";
import fs from "fs";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/assets");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (![".png", ".jpg", ".jpeg", ".gif", ".webp"].includes(ext)) {
    return cb(new Error("Only image files are allowed!"), false);
  }
  cb(null, true);
};

const upload = multer({ storage, fileFilter });

// Custom middleware to check file existence after multer
export const uploadWithCheck = (req, res, next) => {
  const singleUpload = upload.single("picture");

  singleUpload(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    // Check if file exists in disk after multer
    if (!req.file) {
      return res.status(400).json({ message: "No image file uploaded" });
    }

    const filePath = `public/assets/${req.file.filename}`;
    if (!fs.existsSync(filePath)) {
      return res.status(500).json({ message: "Image upload failed" });
    }

    next();
  });
};
