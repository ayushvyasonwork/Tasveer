import User from "../models/User.js";

/* READ */
export const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    res.status(200).json(user);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const getUserFriends = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('id in getUserFriends is ', id);

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const friends = await Promise.all(
      user.friends.map((friendId) => User.findById(friendId))
    );

    // Filter out any null entries (if a friend was deleted or doesn't exist)
    const validFriends = friends.filter(friend => friend !== null);

    const formattedFriends = validFriends.map(
      ({ _id, firstName, lastName, occupation, location, picturePath }) => {
        return { _id, firstName, lastName, occupation, location, picturePath };
      }
    );

    console.log('formattedFriends in getUserFriends is ', formattedFriends);
    res.status(200).json(formattedFriends);
  } catch (err) {
    console.error('Error in getUserFriends:', err);
    res.status(500).json({ message: err.message });
  }
};


/* UPDATE */
export const addRemoveFriend = async (req, res) => {
  try {
    const { id, friendId } = req.params;

    const user = await User.findById(id);
    const friend = await User.findById(friendId);

    if (!user || !friend) {
      return res.status(404).json({ message: "User or Friend not found" });
    }

    if (user.friends.includes(friendId)) {
      // Remove each other
      user.friends = user.friends.filter((fid) => fid.toString() !== friendId);
      friend.friends = friend.friends.filter((fid) => fid.toString() !== id);
    } else {
      // Add each other
      user.friends.push(friendId);
      friend.friends.push(id);
    }

    await user.save();
    await friend.save();

    // Get updated list of user's friends
    const friends = await Promise.all(
      user.friends.map((fid) => User.findById(fid))
    );

    // Filter out any nulls to avoid destructure error
    const validFriends = friends.filter(friend => friend !== null);

    const formattedFriends = validFriends.map(
      ({ _id, firstName, lastName, occupation, location, picturePath }) => ({
        _id,
        firstName,
        lastName,
        occupation,
        location,
        picturePath
      })
    );

    res.status(200).json(formattedFriends);
  } catch (err) {
    console.error('Error in addRemoveFriend:', err);
    res.status(500).json({ message: err.message });
  }
};

export const updateSocialLinks = async (req, res) => {
  try {
    const { id } = req.params;
    const { twitter, linkedin } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      {
        twitter,
        linkedin,
      },
      { new: true } // return updated document
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};