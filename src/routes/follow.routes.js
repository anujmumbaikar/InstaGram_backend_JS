import { Router } from "express";
import {upload} from "../middlewares/multer.middleware.js"
import { followUser, unfollowUser } from "../controllers/follow.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router()
router.route("/follow-user/:username").post(verifyJWT,followUser)
router.route("/unfollow-user/:username").post(verifyJWT,unfollowUser)
export {router as followRouter}