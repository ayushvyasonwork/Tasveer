import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
// import multer from "multer";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import postRoutes from "./routes/posts.js";
import { register } from "./controllers/auth.js";
import { createPost } from "./controllers/posts.js";
import { verifyToken } from "./middleware/auth.js";
import http from "http";
import { Server } from "socket.io";
import storyRoutes from "./routes/storyRoutes.js"; // Correct import
import { createClient } from "redis";
import { uploadWithCheck } from "./middleware/upload.js";
import { cloudinary } from "./config/cloudinary.js";


/* CONFIGURATIONS */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const redisClient = createClient({
  url: process.env.REDIS_URL
});
redisClient.on('error', (err) => console.log('Redis Client Error', err));

(async () => {
  await redisClient.connect();
})();
app.use(express.json());
app.use(morgan("common"));
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use((req, res, next) => {
  req.io = io;
  req.redisClient = redisClient;
  next();
});
app.use("/assets", express.static(path.join(__dirname, "public/assets")));

/* ROUTES WITH FILES */
app.post("/auth/register", uploadWithCheck, register);
app.post("/posts", verifyToken, uploadWithCheck, createPost);

/* SOCKET.IO SETUP */
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Or your specific frontend URL
    methods: ["GET", "POST"],
  },
});
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
  })
  .catch((error) => console.log(`${error} did not connect`));  

/* ROUTES */
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/posts", postRoutes);
// Pass the upload middleware to the story routes
app.use("/stories", storyRoutes(uploadWithCheck));
/* MONGOOSE SETUP */
const PORT = process.env.PORT || 6001;

app.get('/', (req, res) => {
  res.send('Server is running');
});