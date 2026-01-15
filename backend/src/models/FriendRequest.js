/* Import section */
import mongoose from "mongoose";
/* Friend Requests schema */
const friendRequestSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);
// Friend Request model
const FriendRequest = mongoose.model("FriendRequest", friendRequestSchema);
/* Export section */
export default FriendRequest;
