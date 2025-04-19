import { Router } from "express";
import {
  toggleSubscription,
  getUserChannelSubscribers,
  getSubscribedChannels,
} from "../controllers/subscription.controllers.js";
const router = Router();

router.route("/toggle-subscription/:channelId").post(toggleSubscription);
router.route("/get-subscribers/:channelId").get(getUserChannelSubscribers);
router
  .route("/get-subscribed-channels/:subscriberId")
  .get(getSubscribedChannels);
