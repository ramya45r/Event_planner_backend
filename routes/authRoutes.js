import express from "express";
import { register } from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";
const router = express.Router();

router.post("/register", register);


export default router;
