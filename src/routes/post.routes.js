import { Router } from "express";
import { postUpload,deletePost,getPostById,getUserPosts,getAllPosts } from "../controllers/post.controller.js";
import { likePost,unlikePost} from "../controllers/like.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router()

export default router
router.route("/upload-post").post(
    verifyJWT,
    upload.fields([{ name: "content", maxCount: 1 }]),
    postUpload
);
router.route("/delete-post/:postId").post(verifyJWT,deletePost)
router.route("/get-post/:postId").get(verifyJWT,getPostById)
router.route("/get-user-posts/:username").get(verifyJWT,getUserPosts)
router.route("/get-post/:postId/like").post(verifyJWT,likePost)
router.route("/get-post/:postId/unlike").post(verifyJWT,unlikePost)
router.route("/explore").get(verifyJWT,getAllPosts)
export {router as postRouter}