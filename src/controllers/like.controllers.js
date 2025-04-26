import { asyncHandler } from "../utils/asyncHandler.js";
import { Like } from "../models/likes.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.models.js";
import mongoose from "mongoose";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user._id;
  // Checking if the user has already liked the video
  const existingLike = await Like.findOne({ video: videoId, likedBy: userId });

  //if the user has liked the video, remove the like
  if (existingLike) {
    const isDeleted = await Like.deleteOne({ _id: existingLike._id });
    if (!isDeleted) {
      return res
        .status(500)
        .json(
          new ApiResponse(500, {}, "Failed to remove the like in the video")
        );
    }
    return res
      .status(200)
      .json(
        new ApiResponse(200, {}, "Like removed successfully in the video.")
      );
  }

  //if the user has not liked the video then add the like
  const newLike = await Like.create({
    likedBy: userId,
    video: videoId,
  });
  if (!newLike) {
    return res
      .status(500)
      .json(new ApiResponse(500, {}, "Failed to like the video"));
  }
  return res
    .status(200)
    .json(new ApiResponse(201, newLike, "Video liked successfully"));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user._id;
  // Checking if the user has already liked the comment
  const existingLike = await Like.findOne({
    comment: commentId,
    likedBy: userId,
  });

  //if the user has liked the comment, remove the like
  if (existingLike) {
    const isDeleted = await Like.deleteOne({ _id: existingLike._id });
    if (!isDeleted) {
      return res
        .status(500)
        .json(
          new ApiResponse(500, {}, "Failed to remove the like in the comment")
        );
    }
    return res
      .status(200)
      .json(
        new ApiResponse(200, {}, "Like removed successfully in the comment.")
      );
  }

  //if the user has not liked the video then add the like
  const newLike = await Like.create({
    likedBy: userId,
    comment: commentId,
  });
  if (!newLike) {
    return res
      .status(500)
      .json(new ApiResponse(500, {}, "Failed to like the comment."));
  }
  return res
    .status(200)
    .json(new ApiResponse(201, {}, "Comment liked successfully"));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const userId = req.user._id;
  // Checking if the user has already liked the tweet
  const existingLike = await Like.findOne({
    tweet: tweetId,
    likedBy: userId,
  });

  //if the user has liked the tweet, remove the like
  if (existingLike) {
    const isDeleted = await Like.deleteOne({ _id: existingLike._id });
    if (!isDeleted) {
      return res
        .status(500)
        .json(
          new ApiResponse(500, {}, "Failed to remove the like in the tweet")
        );
    }
    return res
      .status(200)
      .json(
        new ApiResponse(200, {}, "Like removed successfully in the comment.")
      );
  }

  //if the user has not liked the video then add the like
  const newLike = await Like.create({
    likedBy: userId,
    tweet: tweetId,
  });
  if (!newLike) {
    return res
      .status(500)
      .json(new ApiResponse(500, {}, "Failed to like the tweet."));
  }
  return res
    .status(200)
    .json(new ApiResponse(201, {}, "Tweet liked successfully"));
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const likedVideos = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(String(req.user._id)),
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "likedBy",
        as: "likes",
        pipeline: [
          {
            $lookup: {
              from: "videos",
              localField: "video",
              foreignField: "_id",
              as: "likedVideo",
            },
          },
          {
            $unwind: "$likedVideo", // Flatten the array of liked videos
          },
        ],
      },
    },
    {
      $unwind: "$likes", // Unwind the likes array
    },
    {
      $replaceRoot: { newRoot: "$likes.likedVideo" }, // Replace root with liked video object
    },
  ]);
  if (!likedVideos.length) {
    return res
      .status(500)
      .json(new ApiResponse(500, {}, "Failed to get liked videos."));
  }
  return res
    .status(200)
    .json(new ApiResponse(200, likedVideos, "Liked videos fetched."));
});
export { toggleVideoLike, toggleCommentLike, toggleTweetLike, getLikedVideos };
