
import express  from "express"
import { authorizeRoles, isAuthenticate } from "../middleware/auth"
import { getNotification, updateNotification } from "../controllers/notification.controller"
const notificationRoute = express.Router()

notificationRoute.get("/get-notification", isAuthenticate, authorizeRoles("admin"), getNotification)
notificationRoute.put("/update-notification/:id", isAuthenticate, authorizeRoles("admin"), updateNotification)



export default notificationRoute