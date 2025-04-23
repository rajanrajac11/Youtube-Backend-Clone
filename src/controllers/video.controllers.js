import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

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

  const videos = await Video.find()
    .limit(limit)
    .skip((page - 1) * limit)
    .sort({ [sortBy]: sortType === "asc" ? 1 : -1 })
    .populate("owner", "name email")
    .exec();

  res.status(200).json(
    new ApiResponse(200, {
      videos,
      pagination: {
        total,
        page,
        limit,
        totalPages: Meth.ceil(total / limit),
      },
    })
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
export { getAllVideos, publishAVideo };
