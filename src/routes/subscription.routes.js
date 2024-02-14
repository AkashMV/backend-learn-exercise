import { Router } from 'express';
import {
    getChannelSubscribers,
    getSubscribedChannels,
    toggleSubscription,
} from "../controllers/subscription.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router
    .route("/c/:channelId")
    .get(getChannelSubscribers)
    .post(toggleSubscription);

router.route("/u").get(getSubscribedChannels);

export default router