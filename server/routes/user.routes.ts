import express from "express";
import {activateUser,deleteUser,getAllUsers,getUSerInfo,loginUser,logoutUser,registrationUser, socialAuth, updateAccessToken, updatePassword, updateProfilePicture, updateUserInfo, updateUserRole} from "../controllers/user.controller"
import {  authorizeRoles, isAuthenticate } from "../middleware/auth";

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
router.get("/get-users", isAuthenticate ,authorizeRoles("admin") ,getAllUsers)
router.put("/update-user-role", isAuthenticate ,authorizeRoles("admin") ,updateUserRole)
router.delete("/delet-user/:id", isAuthenticate ,authorizeRoles("admin") ,deleteUser)






export default router