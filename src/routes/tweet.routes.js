import {Router} from "express"
import { createTweet, } from "../controllers/tweet.controller"
import { verifyJWT } from "../middlewares/auth.middleware"

const router = Router()

router.use(verifyJWT)
router.route("/").post(createTweet)
export default router