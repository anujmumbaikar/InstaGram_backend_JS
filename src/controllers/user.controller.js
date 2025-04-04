import {ApiError} from "../utils/apiError.js";
import {ApiResponse} from "../utils/apiResponse.js";
import {User} from "../models/user.model.js";
import { Post } from "../models/post.model.js";
import {asyncHandler} from '../utils/asyncHandler.js';
import validator from "validator";
import { uploadOnCloudinary } from "../../../02_backend/src/utils/cloudinary.js";

const generateAccessAndRefreshTokens = async(userId)=>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave:false})
        return {accessToken,refreshToken}

    } catch (error) {
        throw new ApiError(500,"something went wrong while generating refresh and access tokens")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    const {fullname,username,email,password} = req.body;
    if (!fullname || !username || !email || !password) {
        throw new ApiError(400, "All fields are required");
    }
    const existsUser = await User.findOne(
        {$or:[{email},{username}]}
    )
    if(existsUser){
        throw new ApiError(409, "User already exists")
    }
    if(!validator.isEmail(email)){
        throw new ApiError(400, "Invalid email")
    }
    if(password.length < 6){
        throw new ApiError(400, "Password must be at least 6 characters")
    }
    const user = await User.create({
        fullname,
        username,
        email,
        password
    })
    if(!user){
        throw new ApiError(500, "User registration failed")
    }
    return res.status(200).json(new ApiResponse(200, "User registered successfully"));
})
const login = asyncHandler(async (req, res) => {
    const {email, password} = req.body;
    if(!email || !password){
        throw new ApiError(400, "All fields are required")
    }
    if(!validator.isEmail(email)){
        throw new ApiError(400, "Invalid email")
    }
    const validateUser = await User.findOne({email})
    if(!validateUser){
        throw new ApiError(401, "User not found, kindly register")
    }
    const isPasswordValid = await validateUser.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new ApiError(404,"incorrect password")
    }
    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(validateUser._id)
    const userLoggedIn = await User.findById(validateUser._id).select("-password -refreshToken")
    if(!userLoggedIn){
        throw new ApiError(500, "User login failed")
    }
    const options ={
        httpOnly:true,
        secure:true,
    }
    res.status(200).cookie("refreshToken", refreshToken, options).cookie("accessToken", accessToken, options)
    .json(new ApiResponse(200,userLoggedIn,"User logged in successfully"))
})
const logout = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {refreshToken: ""},
        {new: true}
    )
    const options = {
        httpOnly: true,
        secure: true,
    }
    return res.status(200).clearCookie("accessToken",options).clearCookie("refreshToken",options).
    json(new ApiResponse(200,{},"user logged out"))
})
const editUserProfile = asyncHandler(async (req, res) => {
    const {
        fullname,
        username,
        email,
        password,
        address,
        gender,
        bio,
        phone
    } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    if (email && email !== user.email) {
        const existingEmailUser = await User.findOne({ email });
        if (existingEmailUser && existingEmailUser._id.toString() !== req.user._id.toString()) {
            throw new ApiError(409, "Email already exists");
        }
    }
    if (username && username !== user.username) {
        const existingUsernameUser = await User.findOne({ username });
        if (existingUsernameUser && existingUsernameUser._id.toString() !== req.user._id.toString()) {
            throw new ApiError(409, "Username already exists");
        }
    }
    if (password && user.password && await user.isPasswordCorrect(password)) {
        throw new ApiError(400, "New password cannot be the same as the old password");
    }
    const updates = {};
    if (req.file?.path) {
        const avatarLocalFilePath = req.file.path;
        const uploadAvatar = await uploadOnCloudinary(avatarLocalFilePath);
    
        if (!uploadAvatar) {
            throw new ApiError(400, "Unable to upload avatar on Cloudinary!");
        }
        updates.avatar = uploadAvatar.url;
    }
    if (fullname) updates.fullname = fullname;
    if (username) updates.username = username;
    if (email) updates.email = email;
    if (password) updates.password = password;
    if (address) updates.address = address;
    if (gender) updates.gender = gender;
    if (bio) updates.bio = bio;
    if (phone) updates.phone = phone;

    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { $set: updates },
        { new: true, runValidators: true }
    ).select("-password -refreshToken");
    if (!updatedUser) {
        throw new ApiError(500, "Failed to update user profile");
    }
    return res
        .status(200)
        .json(new ApiResponse(200, updatedUser, "Account details updated successfully"));
});
const userProfileInformation = asyncHandler(async (req, res) => {
    const { username } = req.params;
    if (!username) {
        throw new ApiError(400, "Unable to get user");
    }
    const getFollowersAndFollowings = await User.aggregate([
        {
            $match: {
                username: username
            }
        },
        {
            $lookup: {
                from: "followers",
                localField: "_id",
                foreignField: "userfollowing",
                as: "followersOfUser"
            }
        },
        {
            $lookup: {
                from: "followers",
                localField: "_id",
                foreignField: "userfollowers",
                as: "followingsOfUser"
            }
        },
        {
            $lookup: {
                from: "posts",
                localField: "_id",
                foreignField: "owner",
                as: "userPosts"
            }
        },
        {
            $addFields: {
                followersCount: { $size: "$followersOfUser" },
                followingsCount: { $size: "$followingsOfUser" },
                userPostsCount: { $size: "$userPosts" },
                ifFollowing: {
                    $cond: {
                        if: { $in: [req.user?._id, "$followersOfUser.userfollowers"] },
                        then: true,
                        else: false
                    }
                },
                userPosts: {
                    $map: {
                        input: "$userPosts",  // Iterating over the user's posts
                        as: "post",
                        in: {
                            _id: "$$post._id", 
                            content: "$$post.content", 
                            caption: "$$post.caption",
                            createdAt: "$$post.createdAt",
                            updatedAt: "$$post.updatedAt"
                        }
                    }
                }
            }
        },
        {
            $project: {
                fullname: 1,
                username: 1,
                avatar: 1,
                bio: 1,
                followersCount: 1,
                followingsCount: 1,
                isFollowing: 1,
                userPostsCount: 1,
                userPosts: 1,
            }
        }
    ]);

    if (!getFollowersAndFollowings || getFollowersAndFollowings.length === 0) {
        throw new ApiError(404, "Unable to get followers and followings");
    }

    return res.status(200).json(new ApiResponse(200, getFollowersAndFollowings[0], "Followers and followings fetched successfully"));
});

export {registerUser, login,logout,editUserProfile,userProfileInformation}