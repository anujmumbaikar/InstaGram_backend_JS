import { Like } from "../models/likes.model.js";
import { Post } from "../models/post.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const likePost = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) throw new ApiError(404, "Post not found");

    const existingLike = await Like.findOne({ post: postId, user: userId });
    if (existingLike) throw new ApiError(400, "Post already liked");

    await Like.create({ post: postId, user: userId });

    res.status(200).json(new ApiResponse(200, {}, "Post liked successfully"));
});
const unlikePost = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const userId = req.user._id;

    const like = await Like.findOne({ post: postId, user: userId });
    if (!like) throw new ApiError(400, "You haven't liked this post yet");

    await Like.deleteOne({ post: postId, user: userId });

    res.status(200).json(new ApiResponse(200, {}, "Post unliked successfully"));
});
export { likePost, unlikePost};