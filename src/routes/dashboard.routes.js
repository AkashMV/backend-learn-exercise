import { Router } from "express";
import {verifyJWT} from "../middlewares/auth.middleware.js"
import { getChannelStats, getChannelVideos } from "../controllers/dashboard.controller.js";

const router = Router()
router.use(verifyJWT)

router.route("/:userId").get(getChannelStats)
router.route("/videos/:userId").get(getChannelVideos)

export default router