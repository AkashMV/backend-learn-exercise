import mongoose, { Mongoose, Schema } from "mongoose"
import { asyncHandler } from "../utils/asynchandler.js"
import { Video } from "../models/video.model.js"
import { deleteCloudinaryImage, deleteCloudinaryVideo, uploadCloudinary } from "../utils/cloudinary.js"
import { ApiError } from "../utils/ApiError.js"
import { fileCheck } from "../utils/multerFileCheck.js"
import {ApiResponse} from "../utils/ApiResponse.js"

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 0, limit = 10, sortBy="views", sortType=-1, userName } = req.query
    if(!userName){
        throw new ApiError(400, "no username provided")
    }
    const videos = await Video.aggregate([
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "temp",
                pipeline: [
                    {
                        $match: {
                            userName: userName
                        }
                    }
                ]
            }
        },
        {
            $match: {
                temp: { $ne: [] } 
            }
        },
        {
            $sort: {
                sortBy: sortType
            }
        },
        {
            $skip: page*limit
        }
    
    ])
    const output = await Video.aggregatePaginate(videos, {page: page, limit: limit})
    .then((results)=>{return results}).catch((e)=>{return e;})
    console.log(output.docs);
    if(!output || output.docs.length < 1){
        return res.status(200).json({"message": "no results"})
    }
    console.log(output);
    const response = new ApiResponse(200, {...output.docs}, "video data fetched")
    res.status(response.statusCode).json(response.data)
})


const uploadVideo = asyncHandler(async (req, res) => {
    const { title, description, keywords, published} = req.body
    const user = req.user
    const userVideo = req.files.video
    const userThumbnail = req.files.thumbnail
    const keywordsArray = keywords.split(',').map(keyword => keyword.trim());

    if(!user){
        throw new ApiError(400, "Unauthorized")
    }
    //file availability check
    if(!title){
        throw new ApiError(400, "title not provided")
    }
    if(!userVideo || !userVideo.length>0){
        throw new ApiError(400, "video file not provided")
    }
    if(!userThumbnail || !userThumbnail.length>0){
        throw new ApiError(400, "thumbnail not provided")
    }
    
    //file format verification
    if(!fileCheck(userVideo[0], "video")){
        throw new ApiError(400, "wrong video format")
    }else if(!fileCheck(userThumbnail[0], 'image')){
        throw new ApiError(400, 'wrong thumbnail format')
    }

    const videoResponse = await uploadCloudinary(userVideo[0].path)
    const thumbnailResponse = await uploadCloudinary(userThumbnail[0].path)

    console.log(videoResponse)
    console.log(thumbnailResponse)

    if(!videoResponse || !thumbnailResponse){
        throw ApiError(400, "media upload error")
    }
    const video = await Video.create({
        owner: user._id,
        videoFile: videoResponse.url,
        videoId: videoResponse.public_id,
        thumbnail: thumbnailResponse.url,
        thumbnailId: thumbnailResponse.public_id,
        title: title,
        description: description,
        duration: videoResponse.duration,
        published: published || true,
        keywords: keywordsArray
    })
    console.log(video)
    if (!video){
        throw new ApiError(500, "Internal Server Error")
    }
    const response = new ApiResponse(200, video, "video uploaded successfully")
    return res.status(response.statusCode).json(response.data)
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!videoId){
        throw new ApiError(400, "video id not provided")
    }
    
    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(400, "no video found")
    }
    const response = new ApiResponse(200, video, "video fetched successfully")
    return res.status(response.statusCode).json(response)
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const {title, description, keywords} = req.body
    if(!videoId){
        throw new ApiError(400, "video id not provided")
    }
    if(title.length < 1){
        throw new ApiError(400, "Please provide a title")
    }

    const keywordsArray = keywords.split(',').map(keyword => keyword.trim())
    const video = await Video.findByIdAndUpdate({

    })

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const user = req.user
    if(!user){
        throw new ApiError(400, "Unauthorized")
    }
    const video = await Video.findOne({$and: [{_id: new mongoose.Types.ObjectId(videoId)}, {owner: user._id}]})
    if(!video){
        throw new ApiError(400, "no authorized video found")
    }
    const deletedVideo  = await Video.findByIdAndDelete(videoId)
    if(!deletedVideo){
        throw new ApiError(400, "Internal Server Error")
    }

    await deleteCloudinaryVideo(video.videoId)
    await deleteCloudinaryImage(video.thumbnailId)
    res.status(200).json({"message": "video deleted succesfully"})
})


/*

can be improved

*/
const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const user = req.user
    if(!user){
        throw new ApiError(400, "Unauthorized")
    }



    const video = await Video.findOne({$and: [{_id: new mongoose.Types.ObjectId(videoId)}, {owner: user._id}]})
    if(!video){
        throw new ApiError(400, "no authorized video found")
    }
    let response
    if(video.published){
        video.published = false
        await video.save()
        response = new ApiResponse(200, video, "video unpublished successfully")
    }else{
        video.published = true
        await video.save()
        response = new ApiResponse(200, video, "video published successfully")
    }
    res.status(response.statusCode).json(response.message)
})

export {
    getAllVideos,
    uploadVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}


