const fileCheck = (multerReturnObject, filetype)=>{
    if(filetype == 'image'){
        if(multerReturnObject.mimetype == 'image/jpeg'
        || multerReturnObject.mimetype == 'image/jpg'
        || multerReturnObject.mimetype == 'image/png'
        ){
            return true
        }else{
            return false
        }
    }else if(filetype == 'video'){
        if(multerReturnObject.mimetype == 'video/mp4'
        ){
            return true
        }else{
            return false
        }
    }else{
        false
    }
}

export  {fileCheck}