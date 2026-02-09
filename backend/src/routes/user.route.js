/* Import section */
import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  accpetFriendRequest,
  deleteNotification,
  getFriendRequests,
  getMyFriends,
  getOutgoingFriendReqs,
  getrecommendedusers,
  rejectFriendRequest,
  sendFriendRequest,
  unfriendUser,
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

// Decline a request
router.delete("/friend-request/:id/decline", rejectFriendRequest);

// Delete a specific notification
router.delete("/notifications/:id", deleteNotification);

//  Unfriend a user
router.delete("/friends/:id", unfriendUser);

/* Export section */
export default router;
