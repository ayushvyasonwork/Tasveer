import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { getImageUrl } from "../utils/getImageUrl.js";


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
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    const cloudinaryImage = req.cloudinaryImage;
    const pictureUrl = cloudinaryImage
      ? await getImageUrl(req, cloudinaryImage.public_id)
      : null;

    // 👤 Create user
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: passwordHash,
      picturePath: pictureUrl,
      friends: [],
      location,
      occupation,
      twitter,
      linkedin,
    });

    const savedUser = await newUser.save();
    const token = jwt.sign(
      { id: savedUser._id },
      process.env.JWT_SECRET,
      { expiresIn: "2m" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 1000 * 60 * 2, // 3 minutes
    });

    const userResponse = savedUser.toObject();
    delete userResponse.password;

    res.status(201).json({ user: userResponse });

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

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "3m" }); 
    const userObject = user.toObject();
    delete userObject.password;
    res.cookie("token", token, {
      httpOnly: true, // Prevents JavaScript access
      secure: process.env.NODE_ENV === "production", // HTTPS only in production
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Cross-site in production
      maxAge: 1000*60*3, // 3 minutes
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
