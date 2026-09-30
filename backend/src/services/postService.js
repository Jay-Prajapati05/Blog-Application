import Post from "../models/Post.js";
import Comment from "../models/comment.js";
import { AppError } from "../utils/AppError.js";

const POSTS_PER_PAGE = 5;

// Escape special regex characters so user input is treated as plain text
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Accept tags as an array or as a comma separated string
const normalizeTags = (tags) => {
  if (!tags) return [];
  const list = Array.isArray(tags) ? tags : String(tags).split(",");
  const cleaned = list.map((t) => String(t).trim().toLowerCase()).filter(Boolean);
  return [...new Set(cleaned)]; // remove duplicates
};

// Finds a post and makes sure the logged-in user is its author
const findOwnedPost = async (id, userId) => {
  const post = await Post.findById(id);
  if (!post) {
    throw new AppError("Post not found", 404);
  }
  if (post.author.toString() !== userId.toString()) {
    throw new AppError("You can only modify your own posts", 403);
  }
  return post;
};

export const createPost = async ({ title, content, tags }, userId) => {
  if (!title?.trim() || !content?.trim()) {
    throw new AppError("Title and content are required", 400);
  }

  const post = await Post.create({
    title: title.trim(),
    content: content.trim(),
    tags: normalizeTags(tags),
    author: userId,
  });

  return post.populate("author", "name");
};

export const getPosts = async ({ page = 1, search = "" }) => {
  const currentPage = Math.max(parseInt(page, 10) || 1, 1);
  const term = String(search).trim();

  // Case-insensitive title search
  const filter = term
    ? { title: { $regex: escapeRegex(term), $options: "i" } }
    : {};

  const [posts, totalPosts] = await Promise.all([
    Post.find(filter)
      .populate("author", "name")
      .sort({ createdAt: -1 }) // newest first
      .skip((currentPage - 1) * POSTS_PER_PAGE)
      .limit(POSTS_PER_PAGE),
    Post.countDocuments(filter),
  ]);

  return {
    posts,
    pagination: {
      page: currentPage,
      totalPages: Math.ceil(totalPosts / POSTS_PER_PAGE),
      totalPosts,
    },
  };
};

export const getPostById = async (id) => {
  const post = await Post.findById(id).populate("author", "name");
  if (!post) {
    throw new AppError("Post not found", 404);
  }
  return post;
};

export const updatePost = async (id, { title, content, tags }, userId) => {
  const post = await findOwnedPost(id, userId);

  // Only update the fields that were actually sent
  if (title !== undefined) {
    if (!String(title).trim()) throw new AppError("Title cannot be empty", 400);
    post.title = String(title).trim();
  }
  if (content !== undefined) {
    if (!String(content).trim()) throw new AppError("Content cannot be empty", 400);
    post.content = String(content).trim();
  }
  if (tags !== undefined) {
    post.tags = normalizeTags(tags);
  }

  await post.save();
  return post.populate("author", "name");
};

export const deletePost = async (id, userId) => {
  const post = await findOwnedPost(id, userId);

  await post.deleteOne();
  // Remove the comments that belonged to this post
  await Comment.deleteMany({ postId: post._id });
};