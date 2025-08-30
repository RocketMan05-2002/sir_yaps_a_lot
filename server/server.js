//  entry point of our backedn server
//  packages - bcryptjs -> to encrypt the passwords and we'll store passwords in mongodb database
//  cloudinary - media images/user profile images on the cloud storage
//  cors - allow backend to connect
//  dotenv - we can use environment variables in our BE server
//  express - we'll create backend server
//  jsonwebtoken - we can generate the token and we can authenticate users using this token
//  mongoose - we can connect our project with mongoDB database
//  socket.io - we can enable the real time chat messaging in our project
//  nodemon.

import express from "express"
import "dotenv/config"
import cors from "cors"
import http from "http"

// create express app using http server
// we are using http because socketio supports this
const app = express();
const server = http.createServer(app);

// middleware setup
app.use(express.json({limit:"4mb"}));
app.use(cors()); // so that it allows all url to connect with our backend

app.use("/api/status" , (req,res)=>{
    res.send("Server is live right?!");
})

// defining port where our server would run
const PORT = process.env.PORT || 8000;

server.listen(PORT,()=>{
    console.log("Server started via port: " + PORT)
})