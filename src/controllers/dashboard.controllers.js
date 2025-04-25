import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";
import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ref } from "process";

const getChannelStatus = asyncHandler(async (req, res) => {
  const { username } = req.user;
  const channel = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "_id",
        foreignField: "owner",
        as: "videos",
        pipeline: [
          {
            $lookup: {
              from: "likes",
              localField: "_id",
              foreignField: "video",
              as: "likes",
            },
          },
          {
            $addFields: {
              likesCount: { $size: "$likes" },
            },
          },
        ],
      },
    },
    {
      $addFields: {
        subscriberCount: { $size: "$subscribers" },
        subscribedToCount: { $size: "$subscribedTo" },
        videoCount: { $size: "$videos" },
        totalLikesCount: { $sum: "$videos.likesCount" },
      },
    },
    {
      $project: {
        password: 0,
        refreshToken: 0,
        avatarPublicId: 0,
        coverImagePublicId: 0,
      },
    },
  ]);

  if (!channel.length) {
    throw new ApiError(404, "Channel not found.");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, channel[0], "Channel status fetched successfully.")
    );
});
const getChannelVideos = asyncHandler(async (req, res) => {
  const { username } = req.user;

  const channel = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "_id",
        foreignField: "owner",
        as: "videos",
      },
    },
  ]);

  if (!channel.length) {
    throw new ApiError(404, "No videos found for this channel.");
  }
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        channel[0].videos,
        "Channel videos fetched successfully."
      )
    );
});

export { getChannelStatus, getChannelVideos };
