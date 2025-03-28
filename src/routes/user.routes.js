import { Router } from "express";
import { registerUser,login} from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router()
router.route("/register").post(registerUser)
router.route("/login").post(login)


export default router