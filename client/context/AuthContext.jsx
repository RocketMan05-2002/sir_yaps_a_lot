import { createContext, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast"
import {io} from "socket.io-client"

const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;

export const AuthContext = createContext();

export const AuthProvider = ({children}) =>{

    const [token,setToken] = useState(localStorage.getItem("token"));
    const [authUser,setAuthUser] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [socket,setSocket] = useState(null);

    // check if user is authenticated and if so, set the user data 
    // and connect the socket.
    const checkAuth = async()=>{
        try{
            const data = await axios.get("api/auth/check");
            if(data.success){
                setAuthUser(data.user);
                connectSocket(data.user);
            }
        }catch(err){
            //toast notification
            toast.error(err.message);
        }
    }

    // login function to handle user authentication and socket connection.
    const login = async(state,credentials)=>{
        // state -> login - login api, and signup state -> signup api
        try{
            const data = await axios.post(`/api/auth/${state}`, credentials);
            if(data.success){
                setAuthUser(data.userData);
                connectSocket(data.userData);
                axios.defaults.headers.common["token"] = data.token;
                setToken(data.token);
                localStorage.setItem("token", data.token);
                toast.success(data.message);
            }else{
                toast.error(data.message);
            }
        }catch(err){
            toast.error("Could not login");
        }
    }

    //logout function to handle user logout and socket disconnection
    const logout = async()=>{
        localStorage.removeItem("token");
        // when we'll remove the token, the user will be logged out.
        setToken(null);
        setAuthUser(null);
        setOnlineUsers([]);
        axios.defaults.headers.common["token"] = null;
        toast.success("logged out successfully");
        socket.disconnect();
    }

    // update profile function to handle user profile updates
    const updateProfile = async(body)=>{
        try{
            const data = await axios.put("/api/auth/updateProfile",body);
            if(data.success){
                setAuthUser(data.user);
                toast.success("Profile updated successfully");
            }
        }catch(err){
            toast.error(err.message);
        }
    }

    //but check auth is to be executed whenever website is opened
    useEffect(()=>{
        if(token){
            axios.defaults.headers.common["token"] = token;
        }
        checkAuth();
    },[]);

    //connect socket function to handle socket connection and online users updates
    const connectSocket = (userData)=>{
        if(!userData || socket?.connected) return;
        const newSocket = io(backendUrl,{
            query:{
                userId: userData._id,
            }
        });
        newSocket.connect();
        setSocket(newSocket);
        newSocket.on("getOnlineUsers",(userIds)=>{
            setOnlineUsers(userIds);
        })
    }

    const value = {
        axios,
        authUser,
        onlineUsers,
        socket,
        login,
        logout,
        updateProfile
    };

    return (
        <AuthContext.Provider value={value} >
            {children}
        </AuthContext.Provider>
    )
}