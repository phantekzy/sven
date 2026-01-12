/* Import section */
import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  getMyFriends,
  getrecommendedusers,
} from "../controlers/user.controler.js";

/* Router */
const router = express.Router();
// Apply auth middleware to all routes
router.use(protectRoute);
// Getting recommended users
router.get("/", getrecommendedusers);
// Get Friends
router.get("/friends", getMyFriends);
/* Friend requests */
router.post("/friend-request/:id", sendFriendRequest);

/* Export section */
export default router;
