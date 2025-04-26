import { Router } from "express";
import {
  addVideoToPlayList,
  createPlaylist,
  deletePlaylist,
  getPlaylistById,
  getUserPlaylists,
  removeVideoFromPlaylist,
  updatePlaylist,
} from "../controllers/playlist.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();
router.route("/create-playlist").post(verifyJWT, createPlaylist);
router.route("/get-user-playlists").get(verifyJWT, getUserPlaylists);
router.route("/get-playlist/:playlistId").get(verifyJWT, getPlaylistById);
router
  .route("/add-video-to-playlist/:playlistId/:videoId")
  .post(verifyJWT, addVideoToPlayList);
router
  .route("/remove-video-from-playlist/:playlistId/:videoId")
  .delete(verifyJWT, removeVideoFromPlaylist);

router.route(" update-playlist/:playlistId").patch(verifyJWT, updatePlaylist);
router.route("delete-playlist/:playlistId").delete(verifyJWT, deletePlaylist);

export default router;
