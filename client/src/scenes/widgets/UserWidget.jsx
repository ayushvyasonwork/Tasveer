import {
  ManageAccountsOutlined,
  EditOutlined,
  LocationOnOutlined,
  WorkOutlineOutlined,
  SaveOutlined,
} from "@mui/icons-material";
import {
  Box,
  Typography,
  Divider,
  useTheme,
  IconButton,
  TextField,
} from "@mui/material";
import UserImage from "components/UserImage";
import FlexBetween from "components/FlexBetween";
import WidgetWrapper from "components/WidgetWrapper";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../axiosInstance"; // Adjust the import path as necessary

const UserWidget = ({ userId, picturePath }) => {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [twitter, setTwitter] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const { palette } = useTheme();
  const navigate = useNavigate();
  const token = useSelector((state) => state.token);
  const dark = palette.neutral.dark;
  const medium = palette.neutral.medium;
  const main = palette.neutral.main;

const getUser = async () => {
  try {
    const response = await api.get(`/users/${userId}`);
    const data = response.data;
    setUser(data);
    setTwitter(data.twitter || "");
    setLinkedin(data.linkedin || "");
  } catch (error) {
    console.error("Error fetching user:", error);
  }
};

const saveSocialLinks = async () => {
  try {
    const response = await api.patch(`/users/${userId}`, {
      twitter,
      linkedin,
    });
    const updatedUser = response.data;
    setUser(updatedUser);
    setEditMode(false);
  } catch (error) {
    console.error("Error saving social links:", error);
  }
};


  useEffect(() => {
    getUser();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!user) return null;

  const {
    firstName,
    lastName,
    location,
    occupation,
    viewedProfile,
    impressions,
    friends,
  } = user;

  return (
    <WidgetWrapper>
      {/* FIRST ROW */}
      <FlexBetween
        gap="0.5rem"
        pb="1.1rem"
        onClick={() => navigate(`/profile/${userId}`)}
      >
        <FlexBetween gap="1rem">
          <UserImage image={picturePath} />
          <Box>
            <Typography
              variant="h4"
              color={dark}
              fontWeight="500"
              sx={{
                "&:hover": {
                  color: palette.primary.light,
                  cursor: "pointer",
                },
              }}
            >
              {firstName} {lastName}
            </Typography>
            <Typography color={medium}>{friends.length} friends</Typography>
          </Box>
        </FlexBetween>
        <ManageAccountsOutlined />
      </FlexBetween>

      <Divider />

      {/* SECOND ROW */}
      <Box p="1rem 0">
        <Box display="flex" alignItems="center" gap="1rem" mb="0.5rem">
          <LocationOnOutlined fontSize="large" sx={{ color: main }} />
          <Typography color={medium}>{location}</Typography>
        </Box>
        <Box display="flex" alignItems="center" gap="1rem">
          <WorkOutlineOutlined fontSize="large" sx={{ color: main }} />
          <Typography color={medium}>{occupation}</Typography>
        </Box>
      </Box>

      <Divider />

      {/* THIRD ROW */}
      <Box p="1rem 0">
        <FlexBetween mb="0.5rem">
          <Typography color={medium}>Who's viewed your profile</Typography>
          <Typography color={main} fontWeight="500">
            {viewedProfile}
          </Typography>
        </FlexBetween>
        <FlexBetween>
          <Typography color={medium}>Impressions of your post</Typography>
          <Typography color={main} fontWeight="500">
            {impressions}
          </Typography>
        </FlexBetween>
      </Box>

      <Divider />

      {/* FOURTH ROW - SOCIAL LINKS */}
      <Box p="1rem 0">
        <Typography fontSize="1rem" color={main} fontWeight="500" mb="1rem">
          Social Profiles
        </Typography>

        {/* Twitter */}
        <FlexBetween gap="1rem" mb="0.5rem">
          <FlexBetween gap="1rem">
            <img src="../assets/twitter.png" alt="twitter" />
            <Box>
              <Typography color={main} fontWeight="500">
                Twitter
              </Typography>
              {editMode ? (
                <TextField
                  variant="standard"
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                  placeholder="Twitter Profile Link"
                />
              ) : (
                <Typography
                  color={medium}
                  sx={{ cursor: twitter ? "pointer" : "default" }}
                  onClick={() =>
                    twitter && window.open(twitter, "_blank", "noopener")
                  }
                >
                  {twitter ? "Visit Profile" : "Not set"}
                </Typography>
              )}
            </Box>
          </FlexBetween>
          {editMode ? (
            <IconButton onClick={saveSocialLinks}>
              <SaveOutlined sx={{ color: main }} />
            </IconButton>
          ) : (
            <IconButton onClick={() => setEditMode(true)}>
              <EditOutlined sx={{ color: main }} />
            </IconButton>
          )}
        </FlexBetween>

        {/* LinkedIn */}
        <FlexBetween gap="1rem">
          <FlexBetween gap="1rem">
            <img src="../assets/linkedin.png" alt="linkedin" />
            <Box>
              <Typography color={main} fontWeight="500">
                LinkedIn
              </Typography>
              {editMode ? (
                <TextField
                  variant="standard"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  placeholder="LinkedIn Profile Link"
                />
              ) : (
                <Typography
                  color={medium}
                  sx={{ cursor: linkedin ? "pointer" : "default" }}
                  onClick={() =>
                    linkedin && window.open(linkedin, "_blank", "noopener")
                  }
                >
                  {linkedin ? "Visit Profile" : "Not set"}
                </Typography>
              )}
            </Box>
          </FlexBetween>
          {editMode ? (
            <IconButton onClick={saveSocialLinks}>
              <SaveOutlined sx={{ color: main }} />
            </IconButton>
          ) : (
            <IconButton onClick={() => setEditMode(true)}>
              <EditOutlined sx={{ color: main }} />
            </IconButton>
          )}
        </FlexBetween>
      </Box>
    </WidgetWrapper>
  );
};

export default UserWidget;
