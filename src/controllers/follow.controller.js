import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { User } from "../models/user.model.js";
import { Follower } from "../models/follower.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
const followUser = asyncHandler(async (req, res) => {
    const { username } = req.params;
    const targetUser = await User.findOne({ username });
    if (!targetUser) {
        throw new ApiError(404, "User not found");
    }
    if (req.user._id.toString() === targetUser._id.toString()) {
        throw new ApiError(400, "You cannot follow yourself");
    }

    const existingFollow = await Follower.findOne({
        userfollowers: req.user._id,
        userfollowing: targetUser._id
    });

    if (existingFollow) {
        throw new ApiError(400, "You are already following this user");
    }
    await Follower.create({
        userfollowers: req.user._id,
        userfollowing: targetUser._id
    });

    return res.status(200).json(new ApiResponse(200, {}, "User followed successfully"));
});
const unfollowUser = asyncHandler(async (req, res) => {
    const { username } = req.params;
    const targetUser = await User.findOne({ username });
    if (!targetUser) {
        throw new ApiError(404, "User not found");
    }
    const existingFollow = await Follower.findOne({
        userfollowers: req.user._id,
        userfollowing: targetUser._id
    });

    if (!existingFollow) {
        throw new ApiError(400, "You are not following this user");
    }
    await Follower.findOneAndDelete({
        userfollowers: req.user._id,
        userfollowing: targetUser._id
    });

    return res.status(200).json(new ApiResponse(200, {}, "User unfollowed successfully"));
});

export { followUser, unfollowUser };
