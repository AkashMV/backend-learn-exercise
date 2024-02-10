import {Router} from "express"
import { createTweet, deleteTweet, getTweetById, updateTweet, } from "../controllers/tweet.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = Router()

router.use(verifyJWT)
router.route("/create").post(createTweet)
router.route("/:user").post(getTweetById)
router.route("/delete").post(deleteTweet)
router.route("/update").post(updateTweet)

export default router