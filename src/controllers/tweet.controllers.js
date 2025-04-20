import { asyncHandler } from "../utils/asyncHandler.js";
import { Tweet } from "../models/tweets.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;
  if (!content) {
    throw new ApiError(400, "Content is required");
  }
  const tweet = await Tweet.create({
    owner: req.user._id,
    content,
  });
  if (!tweet) {
    throw new ApiError(400, "Unable to create tweet");
  }
  return res
    .status(201)
    .json(new ApiResponse(200, tweet, "Tweet created successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const tweets = await Tweet.aggregate([
    {
      $match: { owner: userId },
    },
    {
      $project: {
        content: 1,
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, tweets, "Tweets fetched successfully"));
});

const updateTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const { content } = req.body;
  const tweet = await Tweet.findByIdAndUpdate(
    tweetId,
    { content },
    { new: true, runValidators: true }
  );
  if (!tweet) {
    throw new ApiError(500, "Failed to update tweet");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet updated successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  if (!tweetId) {
    throw new ApiError(400, "Tweet ID is required");
  }
  const tweet = await Tweet.findByIdAndDelete(tweetId);
  if (!tweet) {
    throw new ApiError(500, "Failed to delete tweet");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Tweet deleted successfully"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
