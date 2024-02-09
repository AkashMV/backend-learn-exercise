import { asyncHandler } from "../utils/asynchandler.js"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { uploadCloudinary } from "../utils/cloudinary.js"

const videoUpload = asyncHandler(async (req, res)=>{
    const video = req.file
    const response = await uploadCloudinary(video.path)
    console.log(response);
    if(response){
        return res.status(200)
        .json(response)
    }else{
        return res.status(400).json({"error": "video upload failed"})
    }
})

export {videoUpload}