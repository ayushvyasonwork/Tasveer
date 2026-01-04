import {
  BrowserRouter,
  Navigate,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import HomePage from "scenes/homePage";
import LoginPage from "scenes/loginPage";
import ProfilePage from "scenes/profilePage";
import StoriesPage from "scenes/stories";
import ProtectedRoute from "components/ProtectedRoute";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { CssBaseline, ThemeProvider, Box } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import { themeSettings } from "./theme";
import GameWithNavigate from "components/GameWithNavigate";
import MessagesPage from "scenes/messagePage";
import ChatPage from "scenes/chatPage";
import Navbar from "scenes/navbar"; // Assuming Navbar is a component

function App() {
  const mode = useSelector((state) => state.mode);
  const theme = useMemo(() => createTheme(themeSettings(mode)), [mode]);


  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppContent />
      </ThemeProvider>
    </BrowserRouter>
  );
}

function AppContent() {
  const location = useLocation(); // Get current route location
    const user = useSelector((state) => state.user);
  return (
    <div className="app">
      {/* Render Navbar only if the current route is not /auth */}
      {user && location.pathname !== "/auth" && (
        <Box
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 1100, // high enough to stay above content
            backgroundColor: "background.default", // ensures it's not transparent
          }}
        >
          <Navbar />
        </Box>
      )}

      <Routes>
        {/* "/" route checks for valid token and either redirects to /home or /auth */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Navigate to="/home" replace />
            </ProtectedRoute>
          }
        />

        {/* Login/Register page - accessible without authentication */}
        <Route path="/auth" element={<LoginPage />} />

        {/* Protected routes - require valid token */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/game"
          element={
            <ProtectedRoute>
              <GameWithNavigate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/:userId"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/stories"
          element={
            <ProtectedRoute>
              <StoriesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <MessagesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
