import {Router} from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { upload } from "../middlewares/multer.middleware.js"
import {
    videoUpload,
} from "../controllers/video.contoller.js"


const router = Router()

router.route("/upload-video").post(verifyJWT, upload.single("video"), videoUpload)
export default router