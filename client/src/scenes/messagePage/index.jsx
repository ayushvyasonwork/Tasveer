import { Box, Typography, Divider } from "@mui/material";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import api from "axiosInstance";
import UserListItem from "../../components/UserListItem"
import { setUsers } from "state";

const MessagesPage = () => {
  const dispatch = useDispatch();
  const users = useSelector((state) => state.users);
  const currentUser = useSelector((state) => state.user);

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await api.get("/users");
      dispatch(setUsers({ users: res.data.filter(u => u._id !== currentUser._id) }));
    };
    fetchUsers();
  }, []);
  return (
    <Box display="flex" height="calc(100vh - 80px)">
      {/* LEFT */}
      <Box width="30%" bgcolor="background.alt" p={2}>
        <Typography variant="h6">Messages</Typography>
        <Divider sx={{ my: 2 }} />
        {users.map((user) => (
          <UserListItem key={user._id} user={user} />
        ))}
      </Box>

      {/* RIGHT */}
      <Box flex={1} display="flex" alignItems="center" justifyContent="center">
        <Typography color="text.secondary">
          Select a user to start chatting
        </Typography>
      </Box>
    </Box>
    
  );
};

export default MessagesPage;
