/* Import section */
import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  accpetFriendRequest,
  getFriendRequests,
  getMyFriends,
  getOutgoingFriendReqs,
  getrecommendedusers,
  sendFriendRequest,
} from "../controlers/user.controler.js";

/* Router */
const router = express.Router();
// Apply auth middleware to all routes
router.use(protectRoute);
// Getting recommended users
router.get("/", getrecommendedusers);
// Get Friends
router.get("/friends", getMyFriends);
// Friend request
router.post("/friend-request/:id", sendFriendRequest);
// Accept Friend request
router.put("/friend-request/:id/accept", accpetFriendRequest);
// Getting friends requests
router.get("/friend-requests", getFriendRequests);

router.get("/outgoing-friend-requests", getOutgoingFriendReqs);

/* Export section */
export default router;
