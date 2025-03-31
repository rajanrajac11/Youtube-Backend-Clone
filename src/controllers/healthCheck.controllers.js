import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const healthCheck = asyncHandler(async (req, res) => {
  res.status(200).json(ApiResponse(200, {}, "Server health is ok."));
});

export { healthCheck };
