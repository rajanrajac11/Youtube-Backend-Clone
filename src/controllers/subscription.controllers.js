import { asyncHandler } from "../utils/asyncHandler.js";
import { Subscription } from "../models/subscription.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import mongoose from "mongoose";
const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const isSubscribed = await Subscription.findOne({
    subscriber: req.user._id,
    channel: channelId,
  });

  if (isSubscribed) {
    const deletedSubscription = await Subscription.findByIdAndDelete(
      isSubscribed._id
    );
    if (!deletedSubscription) {
      throw new ApiError(500, "Unsubscription failed");
    }
    return res
      .status(200)
      .json(
        new ApiResponse(200, deletedSubscription, "Unsubscribed successfully")
      );
  }

  const subscription = await Subscription.create({
    subscriber: req.user._id,
    channel: channelId,
  });
  if (!subscription) {
    throw new ApiError(500, "Subscription failed");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, subscription, "Subscribed successfully"));
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const subscribers = await Subscription.aggregate([
    {
      $match: { channel: new mongoose.Types.ObjectId(String(channelId)) },
    },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscriber",
        pipeline: [
          {
            $project: {
              username: 1,
              email: 1,
              fullName: 1,
              avatar: 1,
              _id: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: "$subscriber",
    },
    {
      $replaceRoot: { newRoot: "$subscriber" },
    },
  ]);

  if (subscribers.length === 0) {
    throw new ApiError(404, "No subscribers found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, subscribers, "Subscribers fetched successfully")
    );
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
  const subscribedChannels = await Subscription.aggregate([
    {
      $match: {
        subscriber: new mongoose.Types.ObjectId(String(subscriberId)),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "channel",
        pipeline: [
          {
            $project: {
              _id: 1,
              fullName: 1,
              avatar: 1,
              coverImage: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: "$channel",
    },
    {
      $replaceRoot: {
        newRoot: "$channel",
      },
    },
  ]);
  console.log(subscribedChannels);

  if (!subscribedChannels || subscribedChannels.length === 0) {
    throw new ApiError(404, "No subscribed channels found");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subscribedChannels,
        "Subscribed channels fetched successfully"
      )
    );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
