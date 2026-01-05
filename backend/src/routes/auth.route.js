/* Import section */
import express from "express";
import { Login, Logout, Signup } from "../controlers/auth.controler.js";
/* Router */
const router = express.Router();
/* Sign up */
router.post("/signup", Signup);
/* Login  */
router.post("/login", Login);
/* Logout */
router.post("/logout", Logout);
/* Export section */
export default router;
