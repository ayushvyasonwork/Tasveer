import { useState } from "react";
import {
  Box,
  Button,
  TextField,
  useMediaQuery,
  Typography,
  useTheme,
  CircularProgress, // Import CircularProgress
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { Formik } from "formik";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setLogin } from "state";
import Dropzone from "react-dropzone";
import FlexBetween from "components/FlexBetween";
import api from "axiosInstance";

const registerSchema = yup.object().shape({
  firstName: yup.string().required("required"),
  lastName: yup.string().required("required"),
  email: yup.string().email("invalid email").required("required"),
  password: yup.string().required("required"),
  location: yup.string().required("required"),
  occupation: yup.string().required("required"),
  picture: yup
    .mixed()
    .required("required")
    .test("fileType", "Unsupported File Format", (value) => {
      if (!value) return false;
      return ["image/jpeg", "image/png", "image/jpg", "image/webp", "image/gif"].includes(
        value.type
      );
    }),
  twitter: yup.string().url("Invalid Twitter URL").nullable(),
  linkedin: yup.string().url("Invalid LinkedIn URL").nullable(),
});

const loginSchema = yup.object().shape({
  email: yup.string().email("invalid email").required("required"),
  password: yup.string().required("required"),
});

const initialValuesRegister = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  location: "",
  occupation: "",
  picture: "",
  twitter: "",
  linkedin: "",
};

const initialValuesLogin = {
  email: "j@gmail.com",
  password: "123",
};

const Form = () => {
  const [pageType, setPageType] = useState("login");
  const [isLoading, setIsLoading] = useState(false); // Add loading state
  const [error, setError] = useState(''); // Error state to manage error messages
  const { palette } = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const isLogin = pageType === "login";
  const isRegister = pageType === "register";

  const register = async (values, onSubmitProps) => {
    const formData = new FormData();
    for (let value in values) {
      if (value === "picture") {
        formData.append("picture", values.picture); // 👈 actual file
      } else {
        formData.append(value, values[value]);
      }
    }

    try {
      const savedUserResponse = await api.post("/auth/register", formData, {
        headers: { "Content-Type": "multipart/form-data" }, // 👈 important
      });
      const savedUser = savedUserResponse.data;
      onSubmitProps.resetForm();

      if (savedUser) {
        setPageType("login");
      }
    } catch (error) {
      console.error("Registration failed:", error?.response?.data || error.message);
    }
  };

  const login = async (values, onSubmitProps) => {
    try {
      const response = await api.post("/auth/login", values);

      const loggedIn = response.data;
      onSubmitProps.resetForm();

      if (loggedIn) {
        dispatch(
          setLogin({
            user: loggedIn.user,
            token: loggedIn.token,
          })
        );
        navigate("/home");
      }
    } catch (error) {
      const errorMessage = error?.response?.data || error.message;
      setError(errorMessage); // Set the error message to display it on UI

      console.error("Login failed:", errorMessage);
    }
  };

  const handleFormSubmit = async (values, onSubmitProps) => {
    setIsLoading(true); // Start loading
    if (isLogin) {
      await login(values, onSubmitProps);
    }
    if (isRegister) {
      await register(values, onSubmitProps);
    }
    setIsLoading(false); // Stop loading
  };

  return (
    <Formik
      onSubmit={handleFormSubmit}
      initialValues={isLogin ? initialValuesLogin : initialValuesRegister}
      validationSchema={isLogin ? loginSchema : registerSchema}
    >
      {({
        values,
        errors,
        touched,
        handleBlur,
        handleChange,
        handleSubmit,
        setFieldValue,
        resetForm,
      }) => (
        <form onSubmit={handleSubmit}>
          <Box
            display="grid"
            gap="30px"
            gridTemplateColumns="repeat(4, minmax(0, 1fr))"
            sx={{
              "& > div": { gridColumn: isNonMobile ? undefined : "span 4" },
            }}
          >
            {isRegister && (
              <>
                <TextField
                  label="First Name"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.firstName}
                  name="firstName"
                  error={Boolean(touched.firstName) && Boolean(errors.firstName)}
                  helperText={touched.firstName && errors.firstName}
                  sx={{ gridColumn: "span 2" }}
                />
                <TextField
                  label="Last Name"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.lastName}
                  name="lastName"
                  error={Boolean(touched.lastName) && Boolean(errors.lastName)}
                  helperText={touched.lastName && errors.lastName}
                  sx={{ gridColumn: "span 2" }}
                />
                <TextField
                  label="Location"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.location}
                  name="location"
                  error={Boolean(touched.location) && Boolean(errors.location)}
                  helperText={touched.location && errors.location}
                  sx={{ gridColumn: "span 4" }}
                />
                <TextField
                  label="Occupation"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.occupation}
                  name="occupation"
                  error={Boolean(touched.occupation) && Boolean(errors.occupation)}
                  helperText={touched.occupation && errors.occupation}
                  sx={{ gridColumn: "span 4" }}
                />
                <TextField
                  label="Twitter Profile Link"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.twitter}
                  name="twitter"
                  sx={{ gridColumn: "span 4" }}
                />
                <TextField
                  label="LinkedIn Profile Link"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.linkedin}
                  name="linkedin"
                  sx={{ gridColumn: "span 4" }}
                />
                <Box
                  gridColumn="span 4"
                  border={`1px solid ${palette.neutral.medium}`}
                  borderRadius="5px"
                  p="1rem"
                >
                  <Dropzone
                    acceptedFiles=".jpg,.jpeg,.png"
                    multiple={false}
                    onDrop={(acceptedFiles) =>
                      setFieldValue("picture", acceptedFiles[0])
                    }
                  >
                    {({ getRootProps, getInputProps }) => (
                      <Box
                        {...getRootProps()}
                        border={`2px dashed ${palette.primary.main}`}
                        p="1rem"
                        sx={{ "&:hover": { cursor: "pointer" } }}
                      >
                        <input {...getInputProps()} />
                        {!values.picture ? (
                          <p>Add Picture Here</p>
                        ) : (
                          <FlexBetween>
                            <Typography>{values.picture.name}</Typography>
                            <EditOutlinedIcon />
                          </FlexBetween>
                        )}
                      </Box>
                    )}
                  </Dropzone>
                </Box>
              </>
            )}

            <TextField
              label="Email"
              onBlur={handleBlur}
              onChange={handleChange}
              value={values.email}
              name="email"
              error={Boolean(touched.email) && Boolean(errors.email)}
              helperText={touched.email && errors.email}
              sx={{ gridColumn: "span 4" }}
            />
            <TextField
              label="Password"
              type="password"
              onBlur={handleBlur}
              onChange={handleChange}
              value={values.password}
              name="password"
              error={Boolean(touched.password) && Boolean(errors.password)}
              helperText={touched.password && errors.password}
              sx={{ gridColumn: "span 4" }}
            />
          </Box>

          {/* Error Message */}
          {error && (
  <Typography color="error" sx={{ textAlign: 'center', marginBottom: '10px' }}>
    {error?.msg || error} {/* Check if error has `msg`, otherwise render the error directly */}
  </Typography>
)}


          {/* BUTTONS */}
          <Box>
            <Button
              fullWidth
              type="submit"
              disabled={isLoading} // Disable button when loading
              sx={{
                m: "2rem 0",
                p: "1rem",
                backgroundColor: palette.primary.main,
                color: palette.background.alt,
                "&:hover": { color: palette.primary.main },
                "&:disabled": {
                  backgroundColor: palette.neutral.light,
                  cursor: 'not-allowed'
                }
              }}
            >
              {isLoading ? <CircularProgress size={24} sx={{ color: palette.primary.contrastText }} /> : isLogin ? "LOGIN" : "REGISTER"}
            </Button>
            <Typography
              onClick={() => {
                setPageType(isLogin ? "register" : "login");
                resetForm();
                setError(''); // Clear error when switching between forms
              }}
              sx={{
                textDecoration: "underline",
                color: palette.primary.main,
                "&:hover": {
                  cursor: "pointer",
                  color: palette.primary.light,
                },
              }}
            >
              {isLogin ? "Don't have an account? Sign Up here." : "Already have an account? Login here."}
            </Typography>
          </Box>
        </form>
      )}
    </Formik>
  );
};

export default Form;
