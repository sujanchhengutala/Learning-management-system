import express  from "express"
import { isAuthenticate } from "../middleware/auth"
import { createOrder } from "../controllers/order.controller"

const oredrRouter = express.Router()

oredrRouter.post("/create-order", isAuthenticate, createOrder)

export default oredrRouter