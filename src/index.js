import dotenv from 'dotenv'
import connectDB from "./db/index.js"
import express from 'express'
import {app} from './app.js'

dotenv.config({
    path: "../env"
})


connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () =>{
        console.log(`SERVER RUNNING AT PORT: ${process.env.PORT}`);
    })
})
.catch((error) => {
    console.log(`MONGO DB CONN FAILED : ${error}`);
})