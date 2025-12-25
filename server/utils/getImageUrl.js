export const getImageUrl = async (req, publicId) => {
  console.log("entered get image url");
  if (!publicId) return null;

  // 1️⃣ If already a full Cloudinary (or any http/https) URL, return as is
  if (publicId.startsWith("http://") || publicId.startsWith("https://")) {
    return publicId;
  }

  try {
    // 2️⃣ Try Redis cache first
    const cachedUrl = await req.redisClient.get(`image:${publicId}`);
    if (cachedUrl) {
      console.log("Fetched image URL from Redis:", cachedUrl);
      return cachedUrl;
    }
  } catch (err) {
    console.error("Redis fetch error:", err.message);
  }

  // 3️⃣ Otherwise build Cloudinary URL
  return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${publicId}`;
};
