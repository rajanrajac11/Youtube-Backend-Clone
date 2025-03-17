import { Router } from "express";
import {
  addComment,
  deleteComment,
  getVideoComments,
  updateComment,
} from "../controllers/comment.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();
router.route("/video-comments/:videoId").get(verifyJWT, getVideoComments);
router.route("/add-comment/:videoId").post(verifyJWT, addComment);
router.route("/update-comment/:commentId").patch(verifyJWT, updateComment);
router.route("/delete-comment/:commentId").delete(verifyJWT, deleteComment);

export default router;
