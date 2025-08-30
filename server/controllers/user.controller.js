// here we'd have function for creating account, login, logout, authentication
// updating user info, etc..

import UserModel from "../models/user.model.js"
import bcrypt from "bcryptjs"
import { generateToken } from "../lib/utils.js"

// signup new user
export const signup = async (req,res)=>{
    const { fullName, email, password, bio} = req.body;
    try{
        // check for missing details
        if(!fullName || !email || !password || !bio){
            return res.json({success:false, msg:"Missing details"});
        }

        //check for unique user or not and email:email
        const user = await UserModel.findOne({email});
        if(user){
            return res.json({success:false, msg:"Account already exists"});
        }

        //if user is unique, we'll proceed to generating encrypted password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        //we'll store this password in database instead of original password
        const newUser = await UserModel.create({
            fullName, email, password:hashedPassword, bio
        });
        //new user has been created at the database.
        //next- create token using which we can authenticate the user

        const token = generateToken(newUser._id);
        res.json({
            success: true,
            userData: newUser,
            token,
            msg:"Account created successfully."
        })
    }catch(err){
        res.json({success:false, msg:err.message});
        console.log(err.message);
    }
}

// user login
export const login = async(req,res)=>{
    const {email,password} = req.body;
    try{
        const userData = await UserModel.findOne({email});
        const isPasswordCorrect = await bcrypt.compare(password, userData.password);
        if(!isPasswordCorrect){
            res.json({success:false, msg:"Invalid credentials"});
        }
        //if password is correct, generate token and send in response
        const token = generateToken(userData._id);
        res.json({
            success:true,
            userData,
            token,
            msg:"login successful"
        });
    }catch(err){
        res.json({success:false, msg:err.message});
        console.log(err.message);
    }
}

// api endpoint to verify the user, whether the user is authenticated or not
export const checkAuth = (req,res) =>{
    res.json({success:true, user: req.user});
    // this returns user data when user is authenticated.
}

// function to update their profile.
// and update images too, so we need cloudinary so that user can store image
// on cloud storage.