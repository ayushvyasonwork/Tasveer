import jwt from "jsonwebtoken";

export const verifyToken = async (req, res, next) => {
  try {
    // First check for token in cookies
    let token = req.cookies.token;
    
    // Fallback to Authorization header for backward compatibility
    if (!token) {
      token = req.header("Authorization");
      
      if (!token) {
        return res.status(403).json({ msg: "Access Denied" });
      }
      
      if (token.startsWith("Bearer ")) {
        token = token.slice(7, token.length).trimLeft();
      }
    }

    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(401).json({ error: err.message, msg: "Invalid or expired token" });
  }
};
