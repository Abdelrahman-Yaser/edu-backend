import express from "express";
// import { verifyAdmin, verifyToken } from '../../middleware/verifyJWT.js';
import createArtical from "../../controllers/artical/createArtical.js";
import deleteAtical from "../../controllers/artical/deleteArtical.js";
import {getArticales,getArtical} from "../../controllers/artical/getArtical.js";
import { updateArtical } from "../../controllers/artical/upDate.js";

const articalRouter = express.Router();

articalRouter.route("/").get(getArticales); // Get a single post by ID
articalRouter.route('/create').post(  createArtical)

articalRouter.route('/:id')
.delete(deleteAtical)
.put(updateArtical) // Update a post by ID
.get(getArtical)
; // Delete a post by ID


export default articalRouter;

