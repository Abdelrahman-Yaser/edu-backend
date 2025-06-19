import express from "express";

const courseRouter = express.Router();

import { verifyToken, verifyAdmin } from "../../middleware/verifyJWT.js";
import createCourse from "../../controllers/courses/createCourse.js";
import deleteCourse from "../../controllers/courses/deleteCourse.js";
import { updateCourse } from "../../controllers/courses/upDate.js";
import {getCourseById,getCourses} from "../../controllers/courses/getCourses.js";
courseRouter.route("/").get(getCourses); // Get all courses
courseRouter.route("/create").post(verifyToken, verifyAdmin, createCourse); // Create a new course
courseRouter.route("/:id")
.delete( deleteCourse)
.put(updateCourse)
.get(getCourseById); // Delete a course by ID

export default courseRouter;
