import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asynchandler.js"
import { User } from "../models/user.model.js"
import { Video } from "../models/video.model.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    const user = req.user
    if(!user){
        throw new ApiError(400, "you must be logged in to create a playlist")
    }
    if(!name){
        throw new ApiError(400, "you must give a name to the playlist")
    }
    if(!description){
        throw new ApiError(400, "you must give a description to the playlist")
    }
    const playlist = await Playlist.create(
        {
            name: name,
            description: description,
            owner: user._id
        }
    )
    if(!playlist){
        throw new ApiError(500, "internal server error")
    }
    const response = new ApiResponse(200, playlist, "playlist created successfully")
    return res.status(response.statusCode).json(response.message)
})
//create a change in the model to give the agency to the user to make the playlist public or not
const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    if(!userId){
        throw new ApiError()
    }
    const playlistList = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from:"playlists",
                localField: "_id",
                foreignField: "owner",
                as: "playlists"
            }
        }
    ])
    console.log(playlistList);
    if(!playlistList || playlistList.length < 1){
        throw new ApiError(500, "internal server error")
    }
    if(playlistList[0].playlists.length < 1){
        return res.status(200).json({"message": "no playlist found by the user"})
    }
    const response = new ApiResponse(200, playlistList[0].playlists, "playlists fetched")
    return res.status(response.statusCode).json(response.data)
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    if(!playlistId){
        throw new ApiError(400, "playlist id not provided")
    }
    const playlist = await Playlist.findById(playlistId)
    console.log(playlist) 
    if(!playlist){
        return res.status(400).json("playlist not found")
    }
    return res.status(200).json(playlist)
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    const user = req.user
    if(!user){
        throw new ApiError(400, "you must be logged in to continue")
    }
    if(!playlistId){
        throw new ApiError(400, "playlist id not found")
    }
    if(!videoId){
        throw new ApiError(400, "video id not found")
    }
    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(400, "no video found with the given video id")
    }

    const playlist = await Playlist.find({$and: [{_id: playlistId}, {owner: user._id}]})
    if(!playlist || playlist.length < 1){
        return res.status(400).json({"message": "you have no playlist with that id"})
    }
    if(playlist[0].videos.includes(videoId)){
        return res.status(200).json({"message": "you already have that video in your playlist"})
    }
    playlist[0].videos.push(videoId)
    await playlist[0].save()
    const response = new ApiResponse(200, playlist[0], "video added to the list")
    return res.status(response.statusCode).json(response.data)
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    const user = req.user
    if(!user){
        throw new ApiError(400, "you must be logged in to continue")
    }
    if(!playlistId){
        throw new ApiError(400, "playlist id not found")
    }
    if(!videoId){
        throw new ApiError(400, "video id not found")
    }
    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(400, "no video found with the given video id")
    }

    const playlist = await Playlist.find({$and: [{_id: playlistId}, {owner: user._id}]})
    if(!playlist || playlist.length < 1){
        return res.status(400).json({"message": "you have no playlist with that id"})
    }
    const indexOfVideo = playlist[0].videos.indexOf(videoId)
    if(indexOfVideo !== -1){
        playlist[0].videos.splice(indexOfVideo, 1)
    }else{
        return res.status(400).json({"message": "you have no video with that id in your playlist"})
    }
    await playlist[0].save()
    const response = new ApiResponse(200, playlist[0], "video removed to the list")
    return res.status(response.statusCode).json(response.data)

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const user = req.user
    if(!user){
        throw new ApiError(400, "you are not logged in")
    }
    if(!playlistId){
        throw new ApiError(400, "playlist id not provided")
    }
    const playlist = await Playlist.findOneAndDelete({$and: [{_id: playlistId}, {owner: user._id}]})
    if(!playlist){
        throw new ApiError(500, "internal server error")
    }
    return res.status(200).json({"message": "playlist deleted successfully"})
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    const {playlistId} = req.params
    const user = req.user
    if(!name || !description){
        throw new ApiError(400, "you must provide both name and description")
    }
    if(!user){
        throw new ApiError(400, "you are not logged in")
    }
    if(!playlistId){
        throw new ApiError(400, "playlist id not provided")
    }
    const playlist = await Playlist.findOneAndUpdate({$and: [{_id: playlistId}, {owner: user._id}]},
        {
            name: name,
            description, description
        },
        {
            returnDocument: "after"
        })
    console.log(playlist)
    res.send("F")
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}