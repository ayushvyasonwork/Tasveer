import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  Button,
  CircularProgress,
} from "@mui/material";
import { useSelector } from "react-redux";
import api from "../../axiosInstance";
import io from "socket.io-client";
import Dropzone from "react-dropzone";
import CloseIcon from "@mui/icons-material/Close";
import Navbar from "scenes/navbar";

import socket from "../../socket";

const StoriesPage = () => {
  const [stories, setStories] = useState([]);
  const [image, setImage] = useState(null);
  const [selectedStory, setSelectedStory] = useState(null);
  const [uploading, setUploading] = useState(false);
  const user = useSelector((state) => state.user);

  const fetchStories = async () => {
    try {
      const res = await api.get("/stories");
      setStories(res.data);
    } catch (err) {
      console.error("Error fetching stories:", err);
    }
  };

  const uploadStory = async () => {
    if (!image || !user?._id) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("userId", user._id);
      formData.append("media", image);
      formData.append("storyPath", image.name);

      const res = await api.post("/stories", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Story uploaded successfully:", res.data);
      await fetchStories();
      setImage(null);
    } catch (error) {
      console.error("Error uploading story:", error);
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    fetchStories();
    socket.on("storyExpired", (storyId) => {
      setStories((prev) => prev.filter((s) => s._id !== storyId));
    });
    return () => socket.off("storyExpired");
  }, []);

  return (
    <Box>
      <Navbar />

      {/* Upload Section */}
      <Box
        position="sticky"
        top="64px"
        zIndex={10}
        backgroundColor="#fff"
        p="1rem"
        borderBottom="1px solid #ccc"
      >
        <Typography variant="h5">Add Story</Typography>
        <Dropzone
          acceptedFiles=".jpg,.jpeg,.png"
          multiple={false}
          onDrop={(files) => setImage(files[0])}
        >
          {({ getRootProps, getInputProps }) => (
            <Box
              {...getRootProps()}
              border="2px dashed gray"
              p="1rem"
              mt="0.5rem"
              borderRadius="10px"
              sx={{ cursor: "pointer" }}
            >
              <input {...getInputProps()} />
              <Typography>
                {image ? image.name : "Click or drag image to upload"}
              </Typography>
            </Box>
          )}
        </Dropzone>
        <Button
          onClick={uploadStory}
          disabled={!image || uploading}
          variant="contained"
          sx={{ mt: "0.5rem" }}
        >
          {uploading ? <CircularProgress size={24} color="inherit" /> : "Upload Story"}
        </Button>
      </Box>

      {/* Stories List */}
      <Box p="1rem">
        <Typography variant="h5" mb="1rem">
          User Stories
        </Typography>
        <Box display="flex" flexDirection="column" gap="1rem">
          {stories.map((story) => (
            <Box
              key={story._id}
              display="flex"
              alignItems="center"
              gap="1rem"
              p="0.75rem"
              border="1px solid lightgray"
              borderRadius="10px"
              sx={{
                cursor: "pointer",
                "&:hover": { backgroundColor: "#f5f5f5" },
              }}
              onClick={() => setSelectedStory(story)}
            >
              <Avatar
                src={`${process.env.REACT_APP_API_BASE_URL}/assets/${story.userId?.picturePath}`}
                alt={story.userId?.firstName}
              />
              <Typography fontWeight="500">
                {story.userId?.firstName || "Unknown"}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Fullscreen Story View */}
      {selectedStory && (
        <Box
          position="fixed"
          top={0}
          left={0}
          width="100vw"
          height="100vh"
          bgcolor="rgba(0,0,0,0.9)"
          display="flex"
          justifyContent="center"
          alignItems="center"
          zIndex={2000}
          flexDirection="column"
        >
          <IconButton
            onClick={() => setSelectedStory(null)}
            sx={{
              position: "absolute",
              top: "20px",
              right: "20px",
              color: "#fff",
            }}
          >
            <CloseIcon />
          </IconButton>
          <Box
            width="400px"
            height="700px"
            display="flex"
            justifyContent="center"
            alignItems="center"
            bgcolor="#000"
            borderRadius="16px"
            boxShadow="0 0 20px rgba(255,255,255,0.1)"
          >
            <img
              src={`${process.env.REACT_APP_API_BASE_URL}${selectedStory.mediaUrl}`}
              alt="story"
              style={{
                maxWidth: "100%",
                maxHeight: "90%",
                objectFit: "contain",
                borderRadius: "10px",
                padding: "10px",
                margin: "20px",
              }}
            />
          </Box>
          <Typography color="#fff" mt="1rem">
            {selectedStory.userId?.firstName || "Anonymous"}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default StoriesPage;
