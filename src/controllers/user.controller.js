import {asyncHandler} from "../utils/asynchandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"


const registerUser = asyncHandler( async (req, res)=>{
    const {fullName, email, userName, password} = req.body
    console.log(fullName, email, userName, password);
    
    // if(
    //     [fullName, email, userName, password].some((field)=>field?.trim() === "")
    // ){
    //     throw new ApiError(400, "All fields are compulsary")
    // }
    if(fullName === ""){
        throw new ApiError(400, "full name is not specified")
    }else if(userName === ""){
        throw new ApiError(400, "user name is not specified")
    }else if(email === ""){
        throw new ApiError(400, "email is not specified")
    }else if(password === ""){
        throw new ApiError(400, "password is not specified")
    }
    
    const userExists = User.findOne({
        $or: [{userName}, {email}]
    })

    if(userExists){
        throw new ApiError(409, "Username or email already exists")
    }

    const aviPath = req.files?.avatar[0]?.path
    const coverPath = req.files?.coverImage[0]?.path

    if(!aviPath){
        throw new ApiError(400, "avatar is not specified")
    }

    const avatar = await uploadCloudinary(aviPath)
    const coverImage = await uploadCloudinary(coverPath)

    const user = await User.create({
        userName: userName.toLowerCase(),
        email: email,
        avatar: avatar.url,
        fullName: fullName,
        coverImage: coverImage?.url || "",
        password: password
    })

    const userCreated = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!userCreated){
        throw new ApiError(500, "Database error")
    }

    return res.status(201).json(
        new ApiError(200, userCreated, "User Registered Successfully")
    )
})


export {registerUser}



//get user details from frontend
//validation 
// check if same username/email exists
// check for images/avatar -- check if the user had sent an avi which is requried
// upload tehm to cloudinary
// create user obejct -- make entry in the db
// remove passwrod and refresh token from the response
// confirm user creation
// return response