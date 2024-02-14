import {Router} from "express"
import { createTweet, deleteTweet, getTweetsByUserId, updateTweet, getTweetById} from "../controllers/tweet.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = Router()

router.use(verifyJWT)
router.route("/create").post(createTweet)
router.route("/u/:tweeterId").get(getTweetsByUserId)
router.route("/:tweetId").get(getTweetById)
router.route("/delete/:tweetId").delete(deleteTweet)
router.route("/update/:tweetId").patch(updateTweet)

export default router