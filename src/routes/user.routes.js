import { Router } from "express";
import { registerUser,login,logout,editUserProfile,userfollowersAndFollowings} from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router()
router.route("/register").post(registerUser)
router.route("/login").post(login)
router.route("/logout").post(verifyJWT,logout)
router.route("/edit-user-profile").put(verifyJWT,upload.single('avatar'),editUserProfile)
router.route("/followers-and-followings/:username").get(verifyJWT,userfollowersAndFollowings)
export default router