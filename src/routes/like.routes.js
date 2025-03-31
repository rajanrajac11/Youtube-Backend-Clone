import { Router } from "express";
import {
  getLikedVideos,
  toggleCommentLike,
  toggleTweetLike,
  toggleVideoLike,
} from "../controllers/like.controllers.js";

const router = Router();
router.route("/toggle-video-like/:videoId").post(toggleVideoLike);
router.route("/toggle-comment-like/:commentId").post(toggleCommentLike);
router.route("/toggle-tweet-like/:tweetId").post(toggleTweetLike);
router.route("/get-liked-videos").get(getLikedVideos);

export default router;
