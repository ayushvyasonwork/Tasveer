import User from "../models/User.js";

export const getFormattedFriends = async (friendIds) => {
    console.log('get format function called ')
  return await User.find(
    { _id: { $in: friendIds } },
    "firstName lastName occupation location picturePath"
  );
};
