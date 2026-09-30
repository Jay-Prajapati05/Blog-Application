import { asyncHandler } from "../utils/asyncHandler.js";
import * as postService from "../services/postService.js";

export const createPost = asyncHandler(async (req, res) => {
  const post = await postService.createPost(req.body, req.user._id);
  res.status(201).json({ success: true, post });
});

export const getPosts = asyncHandler(async (req, res) => {
  const { page, search } = req.query;
  const data = await postService.getPosts({ page, search });
  res.json({ success: true, ...data });
});

export const getPost = asyncHandler(async (req, res) => {
  const post = await postService.getPostById(req.params.id);
  res.json({ success: true, post });
});

export const updatePost = asyncHandler(async (req, res) => {
  const post = await postService.updatePost(req.params.id, req.body, req.user._id);
  res.json({ success: true, post });
});

export const deletePost = asyncHandler(async (req, res) => {
  await postService.deletePost(req.params.id, req.user._id);
  res.json({ success: true, message: "Post deleted" });
});