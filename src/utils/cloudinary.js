import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { ApiError } from "./ApiError.js";

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    //upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    //file has been upload successfully
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); //remove the locally saved temporary file as the upload operation got failed
  }
};

const deleteFromCloudinary = async (publicId, resourceType) => {
  try {
    if (!publicId) return null;
    const response = await cloudinary.api
      .delete_resources([publicId], {
        type: "upload",
        resource_type: resourceType,
      })
      .then(() => {});

    return;
  } catch (error) {
    throw new ApiError(
      500,
      "Failed to delete the image from cloudinary during updation"
    );
  }
};

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export { uploadOnCloudinary, deleteFromCloudinary };
