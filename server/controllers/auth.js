import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { getImageUrl } from "../utils/getImageUrl.js";

/* REGISTER USER */
/* REGISTER USER */
export const register = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      location,
      occupation,
      twitter,
      linkedin,
    } = req.body;

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);
    // ✅ Multer stores file as req.file
       const cloudinaryImage = req.cloudinaryImage;
       const pictureUrl = cloudinaryImage
         ? await getImageUrl(req, cloudinaryImage.public_id)
         : null;

    const newUser = new User({
      firstName,
      lastName,
      email,
      password: passwordHash,
      picturePath:pictureUrl, // local filename or later replace with cloudinary URL
      friends: [],
      location,
      occupation,
      twitter,
      linkedin,
    });
    const savedUser = await newUser.save();
    const userResponse = savedUser.toObject();
delete userResponse.password;
res.status(201).json(userResponse);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* LOGGING IN */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) return res.status(400).json({ msg: "User does not exist. " });
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials. " });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    // Remove password from user object
    const userObject = user.toObject();
    delete userObject.password;
    // Set cookie with proper options
    res.cookie("token", token, {
      httpOnly: true, // Prevents JavaScript access
      secure: process.env.NODE_ENV === "production", // HTTPS only in production
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Cross-site in production
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    res.status(200).json({ user: userObject });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* LOGOUT */
export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });
    res.status(200).json({ msg: "Logged out successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
