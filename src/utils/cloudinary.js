import {v2 as cloudinary} from 'cloudinary'
import fs from 'fs'

cloudinary.config({
    cloud_name: 'dyagd3tay', 
    api_key: '766431793846822', 
    api_secret: '***************************' 
})

const uploadCloudinary = async (localFilePath)=>{
    try{
        if(!localFilePath) return null
        const response = await cloudinary.uploader.upload(localFilePath, {resource_type:'auto'})
        console.log('File uploaded', response);
        return response
    } catch(e){
        fs.unlinkSync(localFilePath)
        return null
    }
}


export {uploadCloudinary}