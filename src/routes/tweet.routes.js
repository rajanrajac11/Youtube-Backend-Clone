import { Router } from "express";
import {
  createTweet,
  deleteTweet,
  getUserTweets,
  updateTweet,
} from "../controllers/tweet.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();
router.route("/create-tweet").post(verifyJWT, createTweet);
router.route("/get-user-tweets").get(verifyJWT, getUserTweets);
router.route("/update-tweet/:tweetId").patch(verifyJWT, updateTweet);
router.route("/delete-tweet/:tweetId").delete(verifyJWT, deleteTweet);

export default router;
