import { Router } from "express";
import { 
    registerUser, 
    loginUser, 
    logoutUser, 
    getCurrentUser, 
    changeCurrPassword, 
    getUserChannelProfile, 
    updateUser,
    getWatchHistory
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()
router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser)
router.route("/login").post(loginUser)
router.route("/get-current-user").get(verifyJWT, getCurrentUser)
router.route("/view-channel/:channelname").get(verifyJWT, getUserChannelProfile)
router.route("/change-password").post(verifyJWT, changeCurrPassword)
router.route("/update").patch(verifyJWT, upload.fields(
    [{
        name: "avatar",
        maxCount: 1
    },
    {
        name: "coverImage",
        maxCount: 1
    }]
), updateUser),
router.route("/history").get(verifyJWT, getWatchHistory)
router.route("/logout").post(verifyJWT ,logoutUser)
export default router