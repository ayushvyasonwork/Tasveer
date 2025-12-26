import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { CircularProgress, Box } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { setLogin } from "state";
import api from "axiosInstance";


const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null); 
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user); 
  useEffect(() => {
    if (user === null && isAuthenticated === true) {
      setIsAuthenticated(false);
    }
  }, [user, isAuthenticated]);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const response = await api.get("/verify/verify-token");
        const user = response.data.user;

        // Token is valid, set user in Redux and allow access
        dispatch(
          setLogin({
            user: user,
            token: null, 
          })
        );
        setIsAuthenticated(true);
      } catch (error) {
        // Token is invalid or expired, redirect to auth
        setIsAuthenticated(false);
      }
    };

    verifyAuth();
  }, [dispatch]);

  // While verifying token, show loading spinner
  if (isAuthenticated === null) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // If authenticated but user data is missing (logout scenario), redirect and show loading
  if (!user) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  // If authenticated and user exists, render the component
  return children;
};

export default ProtectedRoute;
