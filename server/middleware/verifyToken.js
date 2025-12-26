import jwt from "jsonwebtoken";

/**
 * Middleware to verify JWT token from cookies
 * Adds decoded user data to req.user if token is valid
 */
export const verifyToken = (req, res, next) => {
  try {
    const token = req.cookies.token;

    // If no token exists, user is not authenticated
    if (!token) {
      return res.status(401).json({ msg: "No token provided. User not authenticated." });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user data to request
    next();
  } catch (error) {
    // Token is expired or invalid
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ msg: "Token has expired. Please login again." });
    }
    return res.status(401).json({ msg: "Invalid token. Please login again." });
  }
};
