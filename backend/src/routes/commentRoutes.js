import { Router } from "express";
import { addComment, getComments } from "../controller/commentController.js";

// mergeParams lets this router read :postId from the parent path
const router = Router({ mergeParams: true });

router.get("/", getComments);
router.post("/", addComment);

export default router;