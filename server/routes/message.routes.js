import express from "express"
import { getMessages, getUsersForSidebar, markMessageAsSeen } from "../controllers/message.controller";
import { protectRoute } from "../middlewares/auth.js";

const MessageRouter = express.Router();

MessageRouter.get("/users", protectRoute , getUsersForSidebar);
MessageRouter.get("/:id", protectRoute , getMessages);
MessageRouter.put("/mark/:id", protectRoute, markMessageAsSeen);

export default MessageRouter;