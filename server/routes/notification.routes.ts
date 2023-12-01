
import express  from "express"
import { authorizeRoles, isAuthenticate } from "../middleware/auth"
import { getNotification } from "../controllers/notification.controller"
const notificationRoute = express.Router()

notificationRoute.get("/get-notification", isAuthenticate, authorizeRoles("admin"), getNotification)

export default notificationRoute