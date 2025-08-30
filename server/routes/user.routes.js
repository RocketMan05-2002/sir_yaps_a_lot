import express from "express";
import { signup, login, updateProfile, checkAuth} from "../controllers/user.controller.js"
import { protectRoute } from "../middlewares/auth.js"

const UserRouter = express.Router();

UserRouter.post("/signup", signup);
UserRouter.post("/login", login);
UserRouter.put("/update-profile", protectRoute, updateProfile);
UserRouter.get("/check", protectRoute, checkAuth);

export default UserRouter;