import dotenv from 'dotenv'
import connectDB from "./db/index.js"

dotenv.config({
    path: "./env"
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
//Straightforward approach
//creating a function
// function connectDB(){

// }
//then calling it..
// connectDB()
//we can improve this
//we will use async await and IIFE functions to establish database connectivity
//we import express and establish a server connection
// const app = express()
// (async () => {
//     try{     await mongoose.connect(`${process.env.MONGO_URL}/${DB_
//    NAME}`)
//         app.on("error", (error)=>{
//             console.log('ERR: ', error);
//             throw error
//         })

//         app.listen(process.env.PORT, ()=>{
//             console.log(`LISTENING ON PORT ${process.env.PORT}`);
//         })
//     } catch(error){
//         console.log(`Error: ${error}`);
//         throw error
//     }
// })()
//the other way ...
// we create a connection instance in a different dir made for db handling and export it