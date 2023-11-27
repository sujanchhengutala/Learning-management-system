import express from "express";
import {activateUser,getUSerInfo,loginUser,logoutUser,registrationUser, socialAuth, updateAccessToken, updatePassword, updateProfilePicture, updateUserInfo} from "../controllers/user.controller"
import {  isAuthenticate } from "../middleware/auth";

const router = express.Router()

router.post("/registration", registrationUser);
router.post("/activate-user", activateUser);

//login
router.post("/login",loginUser )
//logout
router.get("/logout",isAuthenticate, logoutUser)
//refreshtoken
router.get("/refresh", updateAccessToken)
router.get("/me", isAuthenticate ,getUSerInfo)
router.post("/social-auth", socialAuth)
router.put("/update-user-info", isAuthenticate, updateUserInfo)
router.put("/update-password", isAuthenticate, updatePassword)
router.put("/update-user-avatar", isAuthenticate ,updateProfilePicture)

export default router