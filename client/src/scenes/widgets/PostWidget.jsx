import {
  ChatBubbleOutlineOutlined,
  FavoriteBorderOutlined,
  FavoriteOutlined,
  ShareOutlined,
  
} from "@mui/icons-material";
import {
  Box,
  Divider,
  IconButton,
  Typography,
  useTheme,
  TextField,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
} from "@mui/material";
import FlexBetween from "components/FlexBetween";
import Friend from "components/Friend";
import WidgetWrapper from "components/WidgetWrapper";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPost } from "state";
import api from "../../axiosInstance";

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
  getPosts,
  getUserPosts,
}) => {
  const [isComments, setIsComments] = useState(false);
  const [commentsList, setCommentsList] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
   const isProfile = useSelector((state) => state.isProfile); // If using a flag
  const dispatch = useDispatch();
  const token = useSelector((state) => state.token);
  const loggedInUserId = useSelector((state) => state.user._id);
  const isLiked = Boolean(likes[loggedInUserId]);
  const likeCount = Object.keys(likes).length;

  const { palette } = useTheme();
  const main = palette.neutral.main;
  const primary = palette.primary.main;

  // Handle Like
  const patchLike = async () => {
    try {
      const response = await api.patch(`/posts/${postId}/like`, {
        userId: loggedInUserId,
      });
      dispatch(setPost({ post: response.data }));
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  // Add Comment
  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const response = await api.post(`/posts/${postId}/comment`, {
        text: newComment,
        userId: loggedInUserId,
      });

      dispatch(setPost({ post: response.data }));
      setNewComment("");
      setCommentsList((prev) => [...prev, response.data.comments.at(-1)]);
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  // Delete Post
  const handleDeletePost = async () => {
    setLoading(true);
    try {
      await api.delete(`/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setOpen(false);
      isProfile ? await getUserPosts() : await getPosts(); // Refresh
    } catch (err) {
      console.error("Delete failed:", err); 
    } finally {
      setLoading(false);
    }
  };

  // Get Comments
  const getComments = async () => {
    try {
      const response = await api.get(`/posts/${postId}/comments`);
      return response.data;
    } catch (error) {
      console.error("Error fetching comments:", error);
      return [];
    }
  };

  // Fetch Comments on mount or postId change
  useEffect(() => {
    const fetchComments = async () => {
      const commentsData = await getComments();
      setCommentsList(commentsData);
    };
    fetchComments();
  }, [postId]);

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
          src={`${process.env.REACT_APP_API_BASE_URL}/assets/${picturePath}`}
        />
      )}

      {/* Like, Comment & Delete */}
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
            <IconButton onClick={() => setIsComments((prev) => !prev)}>
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
            <IconButton onClick={() => setOpen(true)} color="error" variant="outlined"s>
              <Typography color="error" fontSize="0.9rem">
                Delete
              </Typography>
            </IconButton>
          )}
        </FlexBetween>
      </FlexBetween>

      {/* Comment Section */}
      {isComments && (
        <Box mt="0.5rem">
          {commentsList.map((comment, i) => (
            <Box key={`${comment._id}-${i}`}>
              <Divider />
              <FlexBetween gap="0.75rem" sx={{ m: "0.5rem 0", pl: "1rem" }}>
                <img
                  src={`${process.env.REACT_APP_API_BASE_URL}/assets/${comment.userId.picturePath}`}
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

          {/* Comment Input */}
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
      {/* Confirmation Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this post? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={loading}>
            No
          </Button>
          <Button onClick={handleDeletePost} color="error" disabled={loading}>
            {loading ? <CircularProgress size={20} /> : "Yes, Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </WidgetWrapper>
  );
};
export default PostWidget;