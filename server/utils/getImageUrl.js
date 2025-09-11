export const getImageUrl = async (req, filename) => {
  if (!filename) return null;

  // ✅ If already a full URL (Cloudinary or http://...), return as-is
  if (filename.startsWith("http")) {
    return filename;
  }

  try {
    // ✅ Check Redis cache for Cloudinary URL
    const cachedUrl = await req.redisClient.get(`image:${filename}`);
    if (cachedUrl) {
      return JSON.parse(cachedUrl);
    }
  } catch (err) {
    console.error("Redis fetch error:", err.message);
  }

  // ✅ Fallback to local server path
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  return `${baseUrl}/assets/${filename}`;
};
