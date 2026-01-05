import jwt from "jsonwebtoken";

export const issueWsToken = (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Verify main auth JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Create SHORT-LIVED WS token (30 sec)
    const wsToken = jwt.sign(
      {
        id: decoded.id,
        type: "ws",
      },
      process.env.JWT_SECRET,
      { expiresIn: "30s" }
    );

    res.json({ wsToken });
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};
