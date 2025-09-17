import { useState } from "react";
import {
  Box,
  IconButton,
  InputBase,
  Typography,
  Select,
  MenuItem,
  FormControl,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import VideogameAssetIcon from '@mui/icons-material/VideogameAsset';
import ScheduleIcon from '@mui/icons-material/Schedule';
import {
  Search,
  Message,
  DarkMode,
  LightMode,
  Notifications,
  Help,
  Menu,
  Close,
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { setMode, setLogout } from "state";
import { useNavigate } from "react-router-dom";
import FlexBetween from "components/FlexBetween";

const Navbar = () => {
  const [isMobileMenuToggled, setIsMobileMenuToggled] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const isNonMobileScreens = useMediaQuery("(min-width: 1000px)");

  const theme = useTheme();
  const neutralLight = theme.palette.neutral.light;
  const dark = theme.palette.neutral.dark;
  const background = theme.palette.background.default;
  const primaryLight = theme.palette.primary.light;
  const alt = theme.palette.background.alt;

  const fullName = `${user.firstName} ${user.lastName}`;

  const dropZoneStyle = {
    backgroundColor: theme.palette.mode === 'dark' ? dark : neutralLight,
    width: "150px",
    borderRadius: "0.25rem",
    p: "0.25rem 1rem",
    "& .MuiSvgIcon-root": { pr: "0.25rem", width: "3rem" },
    "& .MuiSelect-select:focus": { backgroundColor: theme.palette.mode === 'dark' ? dark : neutralLight },
    color: theme.palette.mode === 'dark' ? 'white' : 'black',
  };

  return (
    <>
      <FlexBetween padding="1rem 6%" backgroundColor={alt}>
        {/* LEFT SIDE */}
        <FlexBetween gap="1.75rem">
          <Typography
            fontWeight="bold"
            fontSize="clamp(1rem, 2rem, 2.25rem)"
            color="primary"
            onClick={() => navigate("/home")}
            sx={{ "&:hover": { color: primaryLight, cursor: "pointer" } }}
          >
            Snapsy
          </Typography>
          {isNonMobileScreens && (
            <FlexBetween
              backgroundColor={neutralLight}
              borderRadius="9px"
              gap="3rem"
              padding="0.1rem 1.5rem"
            >
              <InputBase placeholder="Search..." />
              <IconButton><Search /></IconButton>
            </FlexBetween>
          )}
        </FlexBetween>

        {/* RIGHT SIDE */}
        {isNonMobileScreens ? (
          <FlexBetween gap="2rem">
            <IconButton onClick={() => dispatch(setMode())}>
              {theme.palette.mode === "dark" ? (
                <DarkMode sx={{ fontSize: "25px", cursor: "pointer" }} />
              ) : (
                <LightMode sx={{ fontSize: "25px", color: dark, cursor: "pointer" }} />
              )}
            </IconButton>

            <VideogameAssetIcon sx={{ fontSize: "25px", cursor: "pointer" }} onClick={() => navigate('/game')} />
            <ScheduleIcon sx={{ fontSize: "25px", cursor: "pointer" }} onClick={() => navigate('/stories')} />
            <Message sx={{ fontSize: "25px", cursor: "pointer" }} />
            <Notifications sx={{ fontSize: "25px", cursor: "pointer" }} />
            <Help sx={{ fontSize: "25px", cursor: "pointer" }} />

            <FormControl variant="standard" value={fullName}>
  <Select
    value={fullName}
    sx={{
      ...dropZoneStyle,
      color: 'black', // Set text color for the displayed value
    }}
    input={<InputBase />}
  >
    <MenuItem value={fullName} sx={{ color: 'black' }}>
      <Typography>{fullName}</Typography>
    </MenuItem>
    <MenuItem 
      onClick={() => dispatch(setLogout())} 
      sx={{ color: 'black' }}  // Force black text color
    >
      Log Out
    </MenuItem>
  </Select>
</FormControl>

          </FlexBetween>
        ) : (
          <IconButton onClick={() => setIsMobileMenuToggled(!isMobileMenuToggled)}>
            <Menu />
          </IconButton>
        )}
      </FlexBetween>

      {/* MOBILE MENU DRAWER */}
      {!isNonMobileScreens && isMobileMenuToggled && (
        <Box
          position="fixed"
          top="0"
          right="0"
          height="100vh"
          width="250px"
          backgroundColor={background}
          zIndex={1000}
          boxShadow="-2px 0 10px rgba(0,0,0,0.3)"
          p="2rem 1rem"
          display="flex"
          flexDirection="column"
          gap="2rem"
        >
          <Close onClick={() => setIsMobileMenuToggled(false)} sx={{ alignSelf: "flex-end" }} />

          {theme.palette.mode === "dark" ? (
            <DarkMode sx={{ fontSize: "25px", cursor: "pointer" }} onClick={() => dispatch(setMode())} />
          ) : (
            <LightMode sx={{ fontSize: "25px", color: dark, cursor: "pointer" }} onClick={() => dispatch(setMode())} />
          )}

          <VideogameAssetIcon sx={{ fontSize: "25px", cursor: "pointer" }} onClick={() => { navigate("/game"); setIsMobileMenuToggled(false); }} />
          <ScheduleIcon sx={{ fontSize: "25px", cursor: "pointer" }} onClick={() => { navigate("/stories"); setIsMobileMenuToggled(false); }} />
          <Message sx={{ fontSize: "25px", cursor: "pointer" }} />
          <Notifications sx={{ fontSize: "25px", cursor: "pointer" }} />
          <Help sx={{ fontSize: "25px", cursor: "pointer" }} />

          <FormControl variant="standard" value={fullName}>
            <Select
              value={fullName}
              sx={dropZoneStyle}
              input={<InputBase />}
            >
              <MenuItem value={fullName}><Typography>{fullName}</Typography></MenuItem>
              <MenuItem onClick={() => dispatch(setLogout())}>Log Out</MenuItem>
            </Select>
          </FormControl>
        </Box>
      )}
    </>
  );
};

export default Navbar;
