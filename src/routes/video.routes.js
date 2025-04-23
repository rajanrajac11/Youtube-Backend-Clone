import { Router } from "express";
import {
  deleteVideo,
  getAllVideos,
  getVideoById,
  publishAVideo,
  togglePublishStatus,
  updateThumbnail,
  updateVideo,
} from "../controllers/video.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { upload } from "../middlewares/multer.middlewares.js";

const router = Router();
router.route("/get-all-videos").get(getAllVideos);
router.route("/publish-video").post(
  verifyJWT,
  upload.fields([
    {
      name: "video",
      maxCount: 1,
    },
    {
      name: "thumbnail",
      maxCount: 1,
    },
  ]),
  publishAVideo
);
router.route("/get-video-by-id/:videoId").get(getVideoById);
router.route("/update-video/:videoId").patch(verifyJWT, updateVideo);
router
  .route("/update-thumbnail/:videoId")
  .patch(verifyJWT, upload.single("thumbnail"), updateThumbnail);
router.route("/delete-video/:videoId").delete(verifyJWT, deleteVideo);
router
  .route("/toggle-publish-status/:videoId")
  .patch(verifyJWT, togglePublishStatus);

export default router;
