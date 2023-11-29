import express  from "express";
import { authorizeRoles, isAuthenticate } from "../middleware/auth";
import { addAnswer, addQestion, addReplyToReview, addReview, editCourse, getAllCourse, getCourseByUser, getSingleCourse, uploadCourse } from "../controllers/course.controller";

const courseRouter = express.Router()

courseRouter.post("/create-course", isAuthenticate, authorizeRoles("admin"), uploadCourse)
courseRouter.put("/edit-course/:id", isAuthenticate, authorizeRoles("admin"), editCourse)
courseRouter.get("/get-single-course/:id", getSingleCourse)
courseRouter.get("/get-all-courses", getAllCourse)
courseRouter.get("/get-course-content/:id", isAuthenticate,getCourseByUser)
courseRouter.put("/add-question", isAuthenticate, addQestion)
courseRouter.put("/add-answers", isAuthenticate, addAnswer)
courseRouter.put("/add-review/:id", isAuthenticate, addReview)
courseRouter.put("/add-reply", isAuthenticate,authorizeRoles("admin"), addReplyToReview)









export default courseRouter