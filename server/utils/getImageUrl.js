export const getImageUrl = (req, filename) => {
  if (!filename) return null;
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  return `${filename}`;
};
