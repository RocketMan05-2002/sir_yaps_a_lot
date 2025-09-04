import express from "express"
import { getMessages, getUsersForSidebar, markMessageAsSeen, sendMessage } from "../controllers/message.controller.js";
import { protectRoute } from "../middlewares/auth.js";

const MessageRouter = express.Router();

MessageRouter.get("/users", protectRoute , getUsersForSidebar);
MessageRouter.get("/:id", protectRoute , getMessages);
MessageRouter.put("/mark/:id", protectRoute, markMessageAsSeen);
MessageRouter.post("/send/:id", protectRoute, sendMessage);

export default MessageRouter;