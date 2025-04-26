import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import mongoose from "mongoose";

const getAllVideos = asyncHandler(async (req, res) => {
  let {
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortType = "desc",
    userId,
  } = req.query;
  page = parseInt(page);
  limit = parseInt(limit);

  const filter = { isPublished: true };

  if (userId) {
    filter.owner = userId;
  }

  const total = await Video.countDocuments(filter);

  const videos = await Video.find({ isPublished: true })
    .limit(limit)
    .skip((page - 1) * limit)
    .sort({ [sortBy]: sortType === "asc" ? 1 : -1 })
    .populate("owner", "fullName avatar")
    .exec();

  res.status(200).json(
    new ApiResponse(
      200,
      {
        videos,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      "All videos fetched successfully"
    )
  );
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  //validating the request body
  if ([title, description].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "Title and description are required");
  }

  //getting the local path of the video and thumbnail
  const videoLocalPath = req.files?.video[0]?.path;

  const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

  if (!videoLocalPath) {
    throw new ApiError(400, "Video file is required");
  }
  if (!thumbnailLocalPath) {
    throw new ApiError(400, "Thumbnail file is required");
  }

  //uploading video on cloudinary
  const videoUploaded = await uploadOnCloudinary(videoLocalPath);
  if (!videoUploaded.url) {
    throw new ApiError(500, "Error uploading video to cloudinary");
  }

  //uploading thumbnail on cloudinary
  const thumbnailUploaded = await uploadOnCloudinary(thumbnailLocalPath);

  if (!thumbnailUploaded.url) {
    throw new ApiError(500, "Error uploading thumbnail to cloudinary");
  }

  const video = await Video.create({
    description,
    title,
    videoFile: videoUploaded.secure_url,
    thumbnail: thumbnailUploaded.secure_url,
    duration: videoUploaded.duration,
    owner: req.user._id,
  });

  res
    .status(201)
    .json(new ApiResponse(200, video, "Video published successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(400, "Video ID is required");
  }

  //checking if the videoId is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid Video ID");
  }

  //fetchinng the published video from the database
  const video = await Video.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(String(videoId)),
        isPublished: true,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      },
    },
    {
      $unwind: "$owner",
    },
    {
      $project: {
        videoFile: 1,
        thumbnail: 1,
        title: 1,
        description: 1,
        duration: 1,
        views: 1,
        isPublished: 1,
        createdAt: 1,
        owner: {
          _id: "$owner._id",
          name: "$owner.username",
          email: "$owner.email",
          avatar: "$owner.avatar",
          fullName: "$owner.fullName",
        },
      },
    },
  ]);

  if (video.length === 0) {
    throw new ApiError(404, "Video not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, video[0], "Video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;

  if (!videoId) {
    throw new ApiError(400, "Video ID is required");
  }

  //checking if the videoId is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid Video ID");
  }

  //validating the request body

  if ([title, description].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "Title and description are required");
  }

  const video = await Video.findByIdAndUpdate(
    videoId,
    {
      title,
      description,
    },
    { new: true, validateBeforeSave: true }
  );

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video updated successfully"));
});

const updateThumbnail = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const thumbnailLocalPath = req.file?.path;

  //checking if the thumbnailLocalPath is valid present or not
  if (!thumbnailLocalPath) {
    throw new ApiError(400, "Thumbnail file is required");
  }

  //uploading thumbnail on cloudinary
  const thumbnailUploaded = await uploadOnCloudinary(thumbnailLocalPath);
  if (!thumbnailUploaded.url) {
    throw new ApiError(500, "Error uploading thumbnail to cloudinary");
  }

  //updating the video thumbnail in the database
  const video = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        thumbnail: thumbnailUploaded.secure_url,
      },
    },
    {
      new: true,
    }
  );
  if (!video) {
    throw new ApiError(404, "Error updating video thumbnail");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video thumbnail updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(400, "Video ID is required");
  }

  //checking if the videoId is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid Video ID");
  }

  const isVideoDeleted = await Video.findByIdAndDelete(videoId);

  if (!isVideoDeleted) {
    throw new ApiError(404, "Error deleting video");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(400, "Video ID is required");
  }

  //checking if the videoId is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid Video ID");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  video.isPublished = !video.isPublished;

  await video.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        _id: video._id,
        isPublished: video.isPublished,
      },
      `Video has been ${video.isPublished ? "published" : "unpublished"} successfully`
    )
  );
});
export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  updateThumbnail,
  deleteVideo,
  togglePublishStatus,
};
