import { Router } from "express";
import {performHealthCheck} from "../controllers/healthcheck.controller.js"

const router = Router()
router.route("/").get(performHealthCheck)
export default router