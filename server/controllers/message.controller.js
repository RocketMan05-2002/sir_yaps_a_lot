import UserModel from "../models/user.model.js"
import MessageModel from "../models/message.model.js"
import cloudinary from "../lib/cloudinary.js"
import { io, userSocketMap} from "../server.js"

// get all users forn sidebar and unseen messages

export const getUsersForSidebar = async(req,res)=>{
    try{
        const userId = req.user._id;
        const filteredUsers = await UserModel.find({_id:{$ne:userId}});
        // number of unseen messages
        let unseenMessages = {}
        const promises = filteredUsers.map(async(user)=>{
            const messages = await MessageModel.find({
                senderId: user._id,
                receiverId: userId,
                seen: false
            });
            if(messages.length>0) unseenMessages[user._id] = messages.length;
        })
        await Promise.all(promises);
        res.json({
            success:true,
            filteredUsers,
            unseenMessages
        });
    }catch(err){
        console.log(err.message);
        res.json({success: false, msg: err.message});
    }
}

// get all messages for selected user
export const getMessages = async(req,res)=>{
    try{
        const {id: selectedUserId} = req.params; // user on whom we have clicked
        const myId = req.user._id; //loggedIn users iD
        const messages = await MessageModel.find({
            $or:[
                {senderId: myId, receiverId: selectedUserId},
                {senderId: selectedUserId, receiverId: myId}
            ]
        });
        // so this will display all the messages between two users.
        // markig messages as read
        await MessageModel.updateMany({senderId: selectedUserId, receiverId: myId}
            ,{seen:true}
        ); // kyuki hamne dekha ya nahi isse seen decide hoga, half of msgs uske side se hoge
        res.json({
            success:true,
            messages
        });

    }catch(err){
        console.log(err.message);
        res.json({success: false, msg: err.message});
    }
}

// api to mark a particular message as seen
export const markMessageAsSeen = async(req,res)=>{
    try{
        const {id} = req.params;
        await MessageModel.findByIdAndUpdate(id,{seen:true});
        res.json({
            success:true
        });
    }catch(err){
        console.log(err.message);
        res.json({success: false, msg: err.message});
    }
}

// controller/api to send the message
export const sendMessage = async(req,res)=>{
    try{
        const {text,image} = req.body;
        const receiverId = req.params.id;
        const senderId = req.user._id;
        
        let imageUrl;
        if(image){
            const upload = await cloudinary.uploader.upload(image);
            imageUrl = upload.secure_url;
        }
        const newMessage = await MessageModel.create({
            senderId,
            receiverId,
            text,
            image: imageUrl
        });
        // but we want this message to be instantly in real time to receiver's chat
        // for that we gotta use socket.io

        //Emit the new message to the receiver's socket
        const receiverSocketId = userSocketMap[receiverId];
        if(receiverSocketId){
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }
        res.json({
            success:true,
            newMessage
        });
    }catch(err){
        console.log(err.message);
        res.json({success: false, msg: err.message});
    }
}

