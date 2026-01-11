/* Import section */
import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";

/* Router */
const router = express.Router();

// Getting recommended users
router.get("/", protectRoute, getrecommendedusers);
// Get Friends
router.get("/friends", protectRoute, getMyFriends);

/* Export section */
export default router;
