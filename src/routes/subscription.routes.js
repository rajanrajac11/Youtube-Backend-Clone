import { Router } from "express";
import {
  toggleSubscription,
  getUserChannelSubscribers,
  getSubscribedChannels,
} from "../controllers/subscription.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
const router = Router();

router
  .route("/toggle-subscription/:channelId")
  .post(verifyJWT, toggleSubscription);
router
  .route("/get-subscribers/:channelId")
  .get(verifyJWT, getUserChannelSubscribers);
router
  .route("/get-subscribed-channels/:subscriberId")
  .get(verifyJWT, getSubscribedChannels);
