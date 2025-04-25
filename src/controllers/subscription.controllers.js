import { asyncHandler } from "../utils/asyncHandler.js";
import { Subscription } from "../models/subscription.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
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
      $match: {
        channel: channelId,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscriber",
      },
    },
    {
      $unwind: "$subscriber",
    },
    {
      $project: {
        channel: 0,
        subscriber: {
          _id: "$subscriber._id",
          fullName: "$subscriber.fullName",
          avatar: "$subscriber.avatar",
          email: "$subscriber.email",
        },
      },
    },
  ]);
  if (!subscribers || subscribers.length === 0) {
    throw new ApiError(404, "No subscribers found");
  }
  const subscribersList = subscribers.map((s) => s.subscriber);
  return res
    .status(200)
    .json(
      new ApiResponse(200, subscribersList, "Subscribers fetched successfully")
    );
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
  const subscribedChannels = await Subscription.aggregate([
    {
      $match: {
        subscriber: subscriberId,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "channel",
      },
    },
    {
      $unwind: "$channel",
    },
    {
      $project: {
        subscriber: 0,
        channel: {
          _id: "$channel._id",
          fullName: "$channel.fullName",
          avatar: "$channel.avatar",
          email: "$channel.email",
        },
      },
    },
  ]);
  if (!subscribedChannels || subscribedChannels.length === 0) {
    throw new ApiError(404, "No subscribed channels found");
  }
  const channelsList = subscribedChannels.map((s) => s.channel);
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        channelsList,
        "Subscribed channels fetched successfully"
      )
    );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
