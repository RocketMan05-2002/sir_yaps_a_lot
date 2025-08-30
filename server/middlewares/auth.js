// middleware to protect routes
import jwt from "jsonwebtoken"
import UserModel from "../models/user.model.js";

export const protectRoute = async(req,res,next)=>{
    try{
        const token = req.headers.token;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await UserModel.findById(decoded.userId).select("-password");
        if(!user) return res.json({success:false, msg:"User not found"});
        req.user = user ; //add userdata in the request
        next();
    }catch(err){
        res.json({success: false, msg:"user not found"});
    }
}