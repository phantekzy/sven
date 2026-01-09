/* Import section */
import { protectRoute } from "../middleware/auth.middleware.js";
import express from "express";
import {
  Login,
  Logout,
  onboard,
  Signup,
} from "../controlers/auth.controler.js";
/* Router */
const router = express.Router();
/* Sign up */
router.post("/signup", Signup);
/* Login  */
router.post("/login", Login);
/* Logout */
router.post("/logout", Logout);
/* OnBoarding */
router.post("/onboarding", protectRoute, onboard);
/* Export section */
export default router;
