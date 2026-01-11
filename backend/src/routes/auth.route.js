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
/* Checking if the user is logged in */
router.get("/me", protectRoute, (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});
/* Export section */
export default router;
