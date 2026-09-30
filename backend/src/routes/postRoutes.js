import { Router } from "express";
import {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost,
} from "../controller/postController.js";
import { protect } from "../middlewares/auth.js";

const router = Router();

router.get("/", getPosts);
router.get("/:id", getPost);

router.post("/", protect, createPost);
router.put("/:id", protect, updatePost);
router.delete("/:id", protect, deletePost);

export default router;