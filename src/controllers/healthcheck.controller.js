import {asyncHandler} from "../utils/asynchandler.js"

const performHealthCheck = asyncHandler(async (req, res)=>{
    return res.status(200).json({"message": "health check success"})
})

export {performHealthCheck}