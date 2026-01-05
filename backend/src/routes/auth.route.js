/* Import section */
import express from "express";
import { Login, Logout, Signup } from "../controlers/auth.controler.js";

/* Router */
const router = express.Router();

/* Sign up */
router.get("/signup", Signup);

/* Login  */
router.get("/login", Login);

/* Logout */
router.get("/logout", Logout);

/* Export section */
export default router;
