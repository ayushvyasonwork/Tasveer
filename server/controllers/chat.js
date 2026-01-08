import Message from "../models/Message.js";

/* GET ALL MESSAGES BETWEEN TWO USERS */
export const getMessages = async (req, res) => {
  try {
    const { otherUserId } = req.params;
    const currentUserId = req.user.id;

    if (!otherUserId) {
      return res.status(400).json({ message: "Other user ID is required" });
    }

    const messages = await Message.find({
      $or: [
        {
          senderId: currentUserId,
          receiverId: otherUserId,
        },
        {
          senderId: otherUserId,
          receiverId: currentUserId,
        },
      ],
    })
      .populate("senderId", "firstName lastName picturePath")
      .populate("receiverId", "firstName lastName picturePath")
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* GET ALL CONVERSATIONS FOR CURRENT USER */
export const getConversations = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    // Get all unique users that current user has chatted with
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: { $oid: currentUserId } },
            { receiverId: { $oid: currentUserId } },
          ],
        },
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$senderId", { $oid: currentUserId }] },
              "$receiverId",
              "$senderId",
            ],
          },
          lastMessage: { $last: "$content" },
          lastMessageTime: { $last: "$createdAt" },
        },
      },
      {
        $sort: { lastMessageTime: -1 },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          _id: 1,
          lastMessage: 1,
          lastMessageTime: 1,
          "user._id": 1,
          "user.firstName": 1,
          "user.lastName": 1,
          "user.picturePath": 1,
        },
      },
    ]);

    res.status(200).json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* SEND MESSAGE (if needed) */
export const sendMessage = async (req, res) => {
  try {
    const { receiverId, content, messageType = "text" } = req.body;
    const senderId = req.user.id;

    if (!receiverId || !content) {
      return res
        .status(400)
        .json({ message: "Receiver ID and content are required" });
    }

    const message = new Message({
      senderId,
      receiverId,
      content,
      messageType,
      status: "sent",
    });

    await message.save();
    await message.populate("senderId", "firstName lastName picturePath");
    await message.populate("receiverId", "firstName lastName picturePath");

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
