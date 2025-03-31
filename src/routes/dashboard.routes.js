import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import {
  getChannelStatus,
  getChannelVideos,
} from "../controllers/dashboard.controllers.js";

const router = Router();

router.route("/get-channel-status").get(verifyJWT, getChannelStatus);
router.route("/get-channel-videos").get(verifyJWT, getChannelVideos);

export default router;
