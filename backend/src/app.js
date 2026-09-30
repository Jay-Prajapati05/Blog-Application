import express from "express";
import { errorHandler } from "./middlewares/errorHandler.js";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";


const app = express();
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  }),
);

// app.use(cors({ origin: process.env.CLIENT_URL }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public")); //use for store files in server
app.use("/api/auth", authRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/posts/:postId/comments", commentRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use(errorHandler);
export { app };
