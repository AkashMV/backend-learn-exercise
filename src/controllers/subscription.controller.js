import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asynchandler.js"
import { Video } from "../models/video.model.js"
import { response } from "express"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    const user = req.user
    if(!user){
        throw new ApiError(400, "you must be logged in to subscribe")
    }
    if(!channelId){
        throw new ApiError(400, "no channel id provided")
    }
    const channel = await User.findById(channelId)
    if(!channel){
        throw new ApiError(400, 'channel not found')
    }
    const subscription = await Subscription.find({$and: [{channel: channelId}, {subscriber: user._id}]})
    console.log(subscription);
    //change it to make it unsci
    if(subscription.length>0){
        const response = new ApiResponse(200, {}, "you are already subscribed")
        res.status(200).json(response.message)
    }else{
        const subscriber = await Subscription.create(
            {
                channel: channelId,
                subscriber: user._id
            }
        )
        if(!subscriber){
            throw new ApiError(500, "internal server error")
        }
        const response = new ApiError(200, {}, `You are now subscribed to ${channel.userName}`)
        console.log(response)
        res.status(200).json(response.message)
    }
})

// controller to return subscriber list of a channel
const getChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    const { page = 2, limit = 1, sortVal="createdAt", sortType=-1 } = req.query
    const user = req.user
    if(!channelId){
        throw new ApiError(400, "channet found")
    }
    if(!user){
        throw new ApiError(400, "unauthorized")
    }

    const channel = await User.findById(channelId)
    if(!channel){
        throw new ApiError(400, "channel not found")
    }
    if(channelId != user._id){
        throw new ApiError(400, "unauthorized")
    }
    const subscribers = await Subscription.aggregate(
        [
            {
                $match: {
                    channel: channel._id
                }
            },
            {
                $sort: {
                    sortVal: sortType
                }
            },
            {
                $skip: page*limit
            }
        ]
    )
    // const paginateSubscirbers = await Subscription.aggregatePaginate(subscribers, {page: page, limit: limit})
    // console.log(paginateSubscirbers)
    // if(!paginateSubscirbers){
    //     throw new ApiError(400, "internal server error")
    // }
    // if(paginateSubscirbers.length < 1){
    //     res.status(200).json({"message": "you have no subscribers"})
    // }
    const response = new ApiResponse(200, subscribers, "data fetched successfully")
    return res.status(response.statusCode).json(response.data)
})


const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { page = 1, limit = 0, sortVal="createdAt", sortType=-1 } = req.query
    const user = req.user
    if(!user){
        throw new ApiError(400, "unauthorized")
    }

    const subscribedChannels = await Subscription.aggregate(
        [
            {
                $match: {
                    subscriber: user._id
                }
            },
            {
                $sort: {
                    sortVal: sortType
                }
            },
            {
                $skip: page*limit
            }
        ]
    )
    console.log(subscribedChannels);
    // const paginateChannels = await Subscription.aggregatePaginate(subscribedChannels  , {page: page, limit: limit})
    // .then((response)=>{return response})
    // .catch((e)=>{throw e})
    // console.log(paginateChannels)

    // if(!paginateChannels){
    //     throw new ApiError(400, "internal server error")
    // }
    // if(paginateChannels.length < 1){
    //     res.status(200).json({"message": "you are not subscribed to any channels"})
    // }
    // const response = new ApiResponse(200, {...paginateChannels.docs}, "data fetched successfully")
    // return res.status(response.statusCode).json(response.data)
    const response = new ApiResponse(200, subscribedChannels, "fetched succesfully")
    return res.status(response.statusCode).json(response.data)
})

export {
    toggleSubscription,
    getChannelSubscribers,
    getSubscribedChannels
}

