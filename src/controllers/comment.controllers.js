import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Video } from "../models/video.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Comment } from "../models/comments.models.js";

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  if (!videoId) {
    throw new ApiError(400, "Video ID is required");
  }
  const comments = await Video.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(String(videoId)),
      },
    },
    {
      $lookup: {
        from: "comments",
        localField: "_id",
        foreignField: "video",
        as: "comments",
      },
    },
    {
      $unwind: "$comments",
    },
    {
      $replaceRoot: {
        newRoot: "$comments",
      },
    },
    {
      $project: {
        video: 0,
      },
    },
  ]);
  return res
    .status(200)
    .json(
      new ApiResponse(200, comments, "Video Comments fetched successfully.")
    );
});

const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { content } = req.body;
  const userId = req.user._id;
  if (!videoId) {
    throw new ApiError(400, "Video ID is required");
  }
  if (!content) {
    throw new ApiError(400, "Content is required");
  }
  const comment = await Comment.create({
    content,
    video: videoId,
    owner: userId,
  });
  if (!comment) {
    throw new ApiError(500, "Failed to add comment");
  }
  return res
    .status(201)
    .json(new ApiResponse(201, comment, "Comment added successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;
  if (!content) {
    throw new ApiError(400, "Content is required");
  }

  const isCommentExists = await Comment.findById(commentId);
  if (!isCommentExists) {
    throw new ApiError(404, "Comment not found");
  }

  const comment = await Comment.findByIdAndUpdate(
    commentId,
    {
      $set: {
        content,
      },
    },
    {
      new: true,
    }
  );
  if (!comment) {
    throw new ApiError(500, "Failed to update comment");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment updated successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (!commentId) {
    throw new ApiError(400, "Comment ID is required");
  }

  const isCommentExists = await Comment.findById(commentId);
  if (!isCommentExists) {
    throw new ApiError(404, "Comment not found");
  }

  const comment = await Comment.findByIdAndDelete(commentId);
  if (!comment) {
    throw new ApiError(500, "Failed to delete comment");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Comment deleted successfully"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
