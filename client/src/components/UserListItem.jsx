import { Avatar, Box, Typography } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { setActiveChatUser } from "state";
import { useNavigate } from "react-router-dom";

const UserListItem = ({ user }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const lastMessage = useSelector(
    (state) => state.conversations[user._id]
  );
  const handleClick = () => {
    dispatch(setActiveChatUser({ user }));
    navigate("/chat");
  };

  return (
    
    <Box
      display="flex"
      alignItems="center"
      gap={2}
      p={1}
      sx={{ cursor: "pointer", "&:hover": { bgcolor: "background.default" } }}
      onClick={handleClick}
    >
      <Avatar src={user.picturePath} />
      <Box>
        <Typography fontWeight="500">
          {user.firstName} {user.lastName}
        </Typography>
        <Typography fontSize="0.8rem" color="text.secondary">
          {lastMessage?.content || "Start chatting"}
        </Typography>
      </Box>
    </Box>
  );
};

export default UserListItem;
