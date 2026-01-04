import {
  Box,
  Typography,
  TextField,
  IconButton,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setLastMessage } from "state";
import {
  connectGoSocket,
  sendGoMessage,
  disconnectGoSocket,
} from "services/goSocket";
const getId = (id) => {
  if (!id) return "";
  if (typeof id === "string") return id;
  if (id.$oid) return id.$oid;
  if (id._id) return id._id;
  return String(id);
};


const ChatPage = () => {
  const dispatch = useDispatch();
  const activeUser = useSelector((state) => state.activeChatUser);
  const currentUser = useSelector((state) => state.user);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  // 🔌 CONNECT TO GO WS
useEffect(() => {
  if (!activeUser) return;

  connectGoSocket((data) => {
    if (data.type === "system") return;

    if (data.type === "ack") {
      dispatch(
        setLastMessage({
          userId: data.message.receiverId,
          message: data.message,
        })
      );
      return;
    }

    setMessages((prev) => [...prev, data]);

    dispatch(
      setLastMessage({
        userId: data.senderId,
        message: data,
      })
    );
  });

}, [activeUser, dispatch]);


  // 📤 SEND MESSAGE
  const sendMessage = () => {
    if (!message.trim()) return;

    const payload = {
      to: activeUser._id,     // receiverId (Mongo)
      content: message,
    };

    // optimistic UI
    const optimisticMsg = {
      senderId: currentUser._id,
      content: message,
    };

    setMessages((prev) => [...prev, optimisticMsg]);

    dispatch(
      setLastMessage({
        userId: activeUser._id,
        message: optimisticMsg,
      })
    );
    sendGoMessage(payload);
    setMessage("");
  };

  if (!activeUser) {
    return <Typography>Select a chat</Typography>;
  }

  return (
    <Box height="calc(100vh - 80px)" display="flex" flexDirection="column">
      {/* Header */}
      <Box p={2} bgcolor="background.alt">
        <Typography fontWeight={600}>
          {activeUser.firstName} {activeUser.lastName}
        </Typography>
      </Box>

<Box flex={1} p={2} overflow="auto">
  {messages.map((m, i) => {
    const senderId = getId(m.senderId);
    const isMe = senderId === currentUser._id;

    return (
      <Box
        key={i}
        display="flex"
        justifyContent={isMe ? "flex-end" : "flex-start"}
        mb={1}
      >
        <Box
          bgcolor={isMe ? "primary.main" : "background.alt"}
          color={isMe ? "white" : "text.primary"}
          p={1.5}
          borderRadius={2}
          maxWidth="60%"
        >
          {m.content}
        </Box>
      </Box>
    );
  })}
</Box>


      {/* Input */}
      <Box p={2} display="flex" gap={1}>
        <TextField
          fullWidth
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <IconButton onClick={sendMessage} color="primary">
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default ChatPage;
