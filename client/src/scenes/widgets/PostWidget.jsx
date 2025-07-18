import {
  ChatBubbleOutlineOutlined,
  FavoriteBorderOutlined,
  FavoriteOutlined,
  ShareOutlined,
} from "@mui/icons-material";
import { Box, Divider, IconButton, Typography, useTheme , TextField, Button } from "@mui/material";
import FlexBetween from "components/FlexBetween";
import Friend from "components/Friend";
import WidgetWrapper from "components/WidgetWrapper";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPost } from "state";
import api from "../../axiosInstance"; // Adjust the import path as necessary

const PostWidget = ({
  postId,
  postUserId,
  name,
  description,
  location,
  picturePath,
  userPicturePath,
  likes,
  comments,
}) => {
  const [isComments, setIsComments] = useState(false);
  const [newComment, setNewComment] = useState("");

  const dispatch = useDispatch();
  const token = useSelector((state) => state.token);
  const loggedInUserId = useSelector((state) => state.user._id);
  const isLiked = Boolean(likes[loggedInUserId]);
  const likeCount = Object.keys(likes).length;

  const { palette } = useTheme();
  const main = palette.neutral.main;
  const primary = palette.primary.main;

  const patchLike = async () => {
    const response = await fetch(`http://localhost:7000/posts/${postId}/like`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: loggedInUserId }),
    });
    const updatedPost = await response.json();
    dispatch(setPost({ post: updatedPost }));
  };
  const handleAddComment = async () => {
  if (!newComment.trim()) return;

  try {
    const response = await api.post(`/posts/${postId}/comment`, {
  text: newComment,
  userId: loggedInUserId,
});

    const updatedPost = await response.json();
    dispatch(setPost({ post: updatedPost }));
    setNewComment(""); // Clear the input
  } catch (error) {
    console.error("Failed to add comment:", error);
  }
};

  const handleDeletePost = async () => {
  try {
    const response = await api.delete(`/posts/${postId}`);

    if (response.status === 200) {
      dispatch({ type: "posts/deletePost", payload: postId });
    } else {
      console.error("Failed to delete post");
    }
  } catch (error) {
    console.error("Error deleting post:", error);
  }
};

console.log("post userId is ", postUserId);
  return (
    <WidgetWrapper m="2rem 0">
      <Friend
        friendId={postUserId}
        name={name}
        subtitle={location}
        userPicturePath={userPicturePath}
      />
      <Typography color={main} sx={{ mt: "1rem" }}>
        {description}
      </Typography>
      {picturePath && (
        <img
          width="100%"
          height="auto"
          alt="post"
          style={{ borderRadius: "0.75rem", marginTop: "0.75rem" }}
          src={`http://localhost:7000/assets/${picturePath}`}
        />
      )}
     <FlexBetween mt="0.25rem">
  <FlexBetween gap="1rem">
    <FlexBetween gap="0.3rem">
      <IconButton onClick={patchLike}>
        {isLiked ? (
          <FavoriteOutlined sx={{ color: primary }} />
        ) : (
          <FavoriteBorderOutlined />
        )}
      </IconButton>
      <Typography>{likeCount}</Typography>
    </FlexBetween>

    <FlexBetween gap="0.3rem">
      <IconButton onClick={() => {
  setIsComments(!isComments);
  console.log("Toggle comments:", !isComments);
}}>
  <ChatBubbleOutlineOutlined />
</IconButton>

      <Typography>{comments.length}</Typography>
    </FlexBetween>
  </FlexBetween>

  <FlexBetween gap="0.5rem">
    <IconButton>
      <ShareOutlined />
    </IconButton>

    {loggedInUserId === postUserId && (
      <IconButton onClick={handleDeletePost}>
        <Typography color="error" fontSize="0.9rem">
          Delete
        </Typography>
      </IconButton>
    )}
  </FlexBetween>
</FlexBetween>

      {isComments && (
  <Box mt="0.5rem">
    {Array.isArray(comments) && comments.map((comment, i) => (
      <Box key={`${name}-${i}`}>
        <Divider />
        <FlexBetween key={i} gap="0.75rem" sx={{ m: "0.5rem 0", pl: "1rem" }}>
  <img
    src={`http://localhost:7000/assets/${comment.userId.picturePath}`}
    alt="user"
    width="30"
    height="30"
    style={{ borderRadius: "50%" }}
  />
  <Box>
    <Typography fontWeight="500" color={main}>
      {comment.userId.firstName} {comment.userId.lastName}
    </Typography>
    <Typography color={main}>{comment.text}</Typography>
  </Box>
</FlexBetween>

      </Box>
    ))}
    <Divider />

    {/* Comment input field */}
    <Box mt="0.75rem" display="flex" gap="1rem" alignItems="center">
      <TextField
        fullWidth
        size="small"
        placeholder="Write a comment..."
        variant="outlined"
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
      />
      <Button
        variant="contained"
        onClick={handleAddComment}
        disabled={!newComment.trim()}
        sx={{ textTransform: "none" }}
      >
        Post
      </Button>
    </Box>
  </Box>
)}


    </WidgetWrapper>
  );
};

export default PostWidget;
