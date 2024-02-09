import {v2 as cloudinary} from 'cloudinary'
import fs from 'fs'

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME, 
    api_key: process.env.CLOUDINARY_KEY, 
    api_secret: process.env.CLOUDINARY_SECRET 
})

const uploadCloudinary = async (localFilePath)=>{
    try{
        if(!localFilePath) return null
        const response = await cloudinary.uploader.upload(localFilePath, {resource_type:'auto'})
        fs.unlinkSync(localFilePath)
        return response
    } catch(e){
        fs.unlinkSync(localFilePath)
        return null
    }
}

const deleteCloudinary = async (...publicId)=>{
    try{
        if(publicId.length > 0){
            const response = await cloudinary.api.delete_resources(publicId, {type: "upload", resource_type: 'auto'})
            return response
        }else{
            return null
        }
    }catch(e){
        console.log(e.error)
        return null
    }
}
export {uploadCloudinary, deleteCloudinary}