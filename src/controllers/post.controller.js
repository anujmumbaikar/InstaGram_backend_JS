import {ApiError} from "../utils/apiError.js";
import {ApiResponse} from "../utils/apiResponse.js";
import {User} from "../models/user.model.js";
import { Post } from "../models/post.model.js";
import {asyncHandler} from '../utils/asyncHandler.js';
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import {Like} from '../models/likes.model.js'
import {Comment} from '../models/comments.model.js'
import mongoose, { mongo } from "mongoose";
const postUpload = asyncHandler(async (req, res) => {
    const { caption } = req.body;
    if (!caption) {
        throw new ApiError(400, "Caption is required");
    }
    const contentLocalFilePath = req.files?.content[0]?.path;
    if(!contentLocalFilePath){
        throw new ApiError(400,"Want To upload Post?? , Try Again")

    }
    const postContent = await uploadOnCloudinary(contentLocalFilePath);
    if(!postContent){
        throw new ApiError(400,"Unable to upload post on cloudinary !")
    }
    const post = await Post.create({
        owner: req.user._id,
        caption,
        content:postContent?.url,
    });
    if (!post) {
        throw new ApiError(500, "Failed to create post");
    }
    return res.status(200).json(new ApiResponse(200, post, "Post created successfully"));
})
const deletePost = asyncHandler(async(req,res)=>{
    const {postId} = req.params;
    if(!postId){
        throw new ApiError(400,"unable to get post")
    }
    const post = await Post.findById(postId);
    if (!post) {
        throw new ApiError(404, "Post not found");
    }
    console.log(req.user._id);
    if(post.owner.toString() != req.user._id.toString()){
        throw new ApiError(403, "You are not authorized to delete this post");
    }
    await Post.findByIdAndDelete(postId);
    return res.status(200).json(new ApiResponse(200, {}, "Post deleted successfully"));
})
const getPostById = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    if (!postId) {
        throw new ApiError(400, "Post ID is required");
    }
    const postInformation = await Post.aggregate([
        {
            $match: {
                _id:new mongoose.Types.ObjectId(postId)
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id", 
                foreignField: "post",
                as: "likes"
            }
        },
        {
            $lookup: {
                from: "comments",
                localField: "_id", 
                foreignField: "post", 
                as: "comments" 
            }
        },
        {
            $addFields: {
                likesCount: { $size: "$likes" },
                commentsCount: { $size: "$comments" },
                usersWhoLiked: {
                    $map: {
                        input: "$likes",
                        as: "like",
                        in: "$$like.user"
                    }
                },
                usersWhoCommented: {
                    $map: {
                        input: "$comments",
                        as: "comment",
                        in: "$$comment.user"
                    }
                }
            }
        },
        {
            $project: {
                content: 1,
                caption: 1,
                owner: 1,
                likesCount: 1,
                commentsCount: 1,
                usersWhoLiked: 1,
                usersWhoCommented: 1,
                createdAt: 1,
                updatedAt: 1
            }
        }
    ]);

    if (!postInformation || postInformation.length === 0) {
        throw new ApiError(404, "Post not found");
    }

    return res.status(200).json(new ApiResponse(200, postInformation[0], "Post details fetched successfully"));
});

const getUserPosts = asyncHandler(async (req, res) => {
    const { username } = req.params;
    const user = await User.findOne({ username });
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    const posts = await Post.find({ owner: user._id }).sort({ createdAt: -1 });
    return res.status(200).json(new ApiResponse(200, posts, "User posts fetched successfully"));
});

export {postUpload,deletePost,getPostById,getUserPosts}