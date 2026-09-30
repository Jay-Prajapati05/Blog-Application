import Comment from "../models/comment.js";
import Post from "../models/Post.js";
import { AppError } from "../utils/AppError.js";

const MAX_TEXT_LENGTH = 500;

// Make sure the post exists before touching its comments
const ensurePostExists = async (postId) => {
  const exists = await Post.exists({ _id: postId });
  if (!exists) {
    throw new AppError("Post not found", 404);
  }
};

export const addComment = async (postId, { name, text }) => {
  if (!name?.trim() || !text?.trim()) {
    throw new AppError("Name and text are required", 400);
  }
  if (text.trim().length > MAX_TEXT_LENGTH) {
    throw new AppError(`Comment cannot exceed ${MAX_TEXT_LENGTH} characters`, 400);
  }

  await ensurePostExists(postId);

  return Comment.create({
    postId,
    name: name.trim(),
    text: text.trim(),
  });
};

export const getCommentsByPost = async (postId) => {
  await ensurePostExists(postId);

  // Newest comments first
  return Comment.find({ postId }).sort({ createdAt: -1 });
};