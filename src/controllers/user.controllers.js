import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { create } from "domain";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
    //getting user details from frontend
    const { username, fullName, email, password } = req.body;
    console.log(username, fullName, email, password);

    //validating whether the required fields are empty or not
    if (
        [username, fullName, email, password].some(
            (field) => field?.trim === ""
        )
    ) {
        throw new ApiError(400, "All fields are required");
    }

    //checking if the username or email already exists
    const existedUser = User.findOne({
        $or: [{ username }, { email }],
    });
    if (existedUser) {
        throw new ApiError(409, "Username or email already exists.");
    }

    //checking whether avatar file exists or not
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required.");
    }

    //uploading on cloudinary
    //this require some time so:-await
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required.");
    }

    //creating newUser
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        username: username.toLowerCase(),
        password,
    });

    //removing the password and refreshToken and again getting user info from db
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        throw new ApiError(
            500,
            "Someting went wrong while registering the user"
        );
    }

    return res
        .status(201)
        .json(
            new ApiResponse(200, createdUser, "User Registered Successfully")
        );
});

export { registerUser };
