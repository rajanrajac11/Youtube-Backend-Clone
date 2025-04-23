import { Playlist } from "../models/playlists.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import { Video } from "../models/video.models.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  if (name === "") {
    throw new ApiError(400, "Playlist name is required");
  }
  const playlist = await Playlist.create({
    name,
    description,
    owner: req.user._id,
  });
  if (!playlist) {
    throw new ApiError(500, "Error creating playlist");
  }
  return res
    .status(201)
    .json(new ApiResponse(200, playlist, "Playlist created successfully"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const playlists = await Playlist.find({ owner: userId }).select(
    "name description createdAt updatedAt"
  );
  if (playlists.length === 0) {
    throw new ApiError(404, "No playlists found for this user");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, playlists, "Playlists retrieved successfully"));
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const playlists = await Playlist.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(String(playlistId)),
        owner: req.user._id,
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "videos",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    username: 1,
                    fullName: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $unwind: "$owner",
          },
        ],
      },
    },
  ]);

  if (playlists.length === 0) {
    throw new ApiError(404, "Playlist not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, playlists[0], "Playlist fetched successfully"));
});

const addVideoToPlayList = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  //find the playlist by id
  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }
  //check if the video exists
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  //check if the video is already in the playlist
  if (playlist.videos.includes(videoId)) {
    throw new ApiError(400, "Video already exists in the playlist");
  }

  playlist.videos.push(videoId);
  await playlist.save();
  return res
    .status(200)
    .json(
      new ApiResponse(200, playlist, "Video added to playlist successfully")
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  //find the playlist by id
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  //check if the video exists
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  //check if the video is already in the playlist
  if (!playlist.videos.includes(videoId)) {
    throw new ApiError(400, "Video does not exist in the playlist");
  }

  //remove the video from the playlist
  playlist.videos = playlist.videos.filter(
    (videoObjectId) => videoObjectId.toString() !== videoId
  );

  //save the playlist
  await playlist.save();

  //find the playlist again to return the updated playlist
  const updatedPlaylist = await Playlist.findById(playlistId);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedPlaylist,
        "Video removed from playlist successfully"
      )
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  //find the playlist by id
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  const isPlaylistDeleted = await Playlist.findByIdAndDelete(playlistId);

  if (!isPlaylistDeleted) {
    throw new ApiError(404, "Playlist not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Playlist deleted successfully"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  //find the playlist by id
  const playlist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      name,
      description,
    },
    {
      new: true,
    }
  );
  if (!playlist) {
    throw new ApiError(404, "Failed to update playlist");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist updated successfully"));
});
export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlayList,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
