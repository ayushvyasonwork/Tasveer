// src/scenes/stories/index.jsx
import { useState, useEffect } from "react";
import { Box, Typography, IconButton, Button } from "@mui/material";
import { useSelector } from "react-redux";
import axios from "axios";
import io from "socket.io-client";
import Dropzone from "react-dropzone";
import Navbar from "scenes/navbar";

const socket = io("http://localhost:7000", {
  transports: ["websocket"],
  withCredentials: true,
});

const StoriesPage = () => {
  const [stories, setStories] = useState([]);
  const [image, setImage] = useState(null);
  const user = useSelector((state) => state.user);
  const token = useSelector((state) => state.token);

  const fetchStories = async () => {
    const res = await axios.get("http://localhost:7000/stories", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setStories(res.data);
  };

  const uploadStory = async () => {
    const formData = new FormData();
    formData.append("userId", user._id);
    formData.append("media", image);
    formData.append("storyPath", image.name);

    const res = await axios.post("http://localhost:7000/stories", formData, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setStories((prev) => [res.data, ...prev]);
    setImage(null);
  };

  useEffect(() => {
    fetchStories();
    socket.on("storyExpired", (storyId) => {
      setStories((prev) => prev.filter((s) => s._id !== storyId));
    });
    // socket.on("newStory", (story) => {
    //   setStories((prev) => [story, ...prev]);
    // });

    return () => socket.off("storyExpired");
  }, []);
//   socket.on("newStory", (story) => {
//   setStories((prev) => {
//     const isDuplicate = prev.some((s) => s._id === story._id);
//     return isDuplicate ? prev : [story, ...prev];
//   });
// });


  return (
    <Box>
        <Navbar />
    <Box p="2rem">
        
      <Typography variant="h4">Stories</Typography>

      <Dropzone acceptedFiles=".jpg,.jpeg,.png" multiple={false} onDrop={(files) => setImage(files[0])}>
        {({ getRootProps, getInputProps }) => (
          <Box {...getRootProps()} border="2px dashed gray" p="1rem" mt="1rem">
            <input {...getInputProps()} />
            <Typography>{image ? image.name : "Upload a story image"}</Typography>
          </Box>
        )}
      </Dropzone>
      <Button onClick={uploadStory} disabled={!image} variant="contained" sx={{ mt: "1rem" }}>Upload Story</Button>

      <Box mt="2rem">
        {stories.map((story) => (
          <Box key={story._id} mb="1rem" border="1px solid lightgray" p="1rem">
            <img
  src={`http://localhost:7000${story.mediaUrl}`}
  alt="story"
  style={{
    width: "200px",
    height: "300px",
    objectFit: "cover", // or "contain" if you want to see full image
    borderRadius: "10px"
  }}
/>


            <Typography>{story.userId.firstName}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
    </Box>
  );
};

export default StoriesPage;
