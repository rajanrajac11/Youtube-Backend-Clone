import { asyncHandler } from "../utils/asyncHandler.js";
import { Subscription } from "../models/subscription.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const userId = req.user._id;
  const isSubscribed = await Subscription.findOne({
    userId: req.user._id,
    channelId: channelId,
  });
  if (isSubscribed) {
    await Subscription.deleteOne({
      userId: req.user._id,
      channelId: channelId,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, "Unsubscribed successfully", null));
  }
  const subscription = await Subscription.create({
    userId: req.user._id,
    channelId: channelId,
  });
  if (!subscription) {
    throw new ApiError(500, "Subscription failed");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, "Subscribed successfully", null));
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
