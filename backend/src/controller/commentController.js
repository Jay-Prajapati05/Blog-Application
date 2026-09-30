import { asyncHandler } from "../utils/asyncHandler.js";
import * as commentService from "../services/commentService.js";

export const addComment = asyncHandler(async (req, res) => {
  const comment = await commentService.addComment(req.params.postId, req.body);
  res.status(201).json({ success: true, comment });
});

export const getComments = asyncHandler(async (req, res) => {
  const comments = await commentService.getCommentsByPost(req.params.postId);
  res.json({ success: true, comments });
});