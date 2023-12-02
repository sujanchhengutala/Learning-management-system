import express  from "express"
import { authorizeRoles, isAuthenticate } from "../middleware/auth"
import { createOrder, getAllOrders } from "../controllers/order.controller"

const oredrRouter = express.Router()

oredrRouter.post("/create-order", isAuthenticate, createOrder)
oredrRouter.get("/get-orders", isAuthenticate, authorizeRoles("admin"),getAllOrders)


export default oredrRouter