/* Import section */
import FriendRequest from "../models/FriendRequest.js";
import User from "../models/User.js";

/* Recommended users section*/
export async function getrecommendedusers(req, res) {
  try {
    const currentUserId = req.user._id;
    const currentUser = req.user;

    const recommendedUsers = await User.find({
      $and: [
        { _id: { $ne: currentUserId } },
        { _id: { $nin: currentUser.friends } },
        { isOnboarded: true },
      ],
    }).select("-password");
    res.status(200).json(recommendedUsers);
  } catch (error) {
    console.error("Error in the getrecommendedusers controler", error.message);
    res.status(500).json({ message: "Internal server Error" });
  }
}

/* Friends section */
export async function getMyFriends(req, res) {
  try {
    const user = await User.findById(req.user._id)
      .select("friends")
      .populate(
        "friends",
        "fullName profilePic nativeLanguage learningLanguage",
      );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user.friends);
  } catch (error) {
    console.error("Error in getMyFriends controler", error.message);
    res.status(500).json({ message: "Internal server Error" });
  }
}

/* Friends Request section */
export async function sendFriendRequest(req, res) {
  try {
    // The user id
    const myId = req.user._id;
    // The friends id
    const { id: recipientId } = req.params;
    // Prevent the user to send a friend request to him self lol
    if (myId.toString() === recipientId)
      return res.status(400).json({
        message: "Dummy you can not send a Friend requiest to your self smh!",
      });
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: "Recipient not found" });
    }
    // Checking if the users are already firends
    if (recipient.friends.includes(myId)) {
      return res
        .status(400)
        .json({ message: "You are already friend whith this user" });
    }
    // Existing request
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: myId, recipient: recipientId },
        { sender: recipientId, recipient: myId },
      ],
    });
    if (existingRequest) {
      return res.status(400).json({
        message: "A friend request already exists between you and this user",
      });
    }
    // Creation of the friend request (FINALLY)
    const friendRequest = await FriendRequest.create({
      sender: myId,
      recipient: recipientId,
    });
    res.status(201).json(friendRequest);
  } catch (error) {
    console.error("Error in sendFriendRequest controler", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
/* Accepting friend request */
export async function accpetFriendRequest(req, res) {
  try {
    // The id
    const { id: requestId } = req.params;
    // Find the id
    const friendRequest = await FriendRequest.findById(requestId);
    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found" });
    }
    // Check if the current user is the recipient
    if (friendRequest.recipient.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You are not Authorized to accept this request" });
    }
    // Accept the request
    friendRequest.status = "accepted";
    await friendRequest.save();
    // Add each other to their friends lists
    await Promise.all([
      User.findByIdAndUpdate(friendRequest.sender, {
        $addToSet: { friends: friendRequest.recipient },
      }),
      User.findByIdAndUpdate(friendRequest.recipient, {
        $addToSet: { friends: friendRequest.sender },
      }),
    ]);
    res.status(200).json({ message: "Friend Request Accepted" });
  } catch (error) {
    console.error("Error in AcceptFriendRequest controler", error.message);
    res.status(500).json({ message: "Internal server Error" });
  }
}
// Getting Friends Requests
export async function getFriendRequests(req, res) {
  try {
    // Fetch requests sent to the user
    const incomingReqs = await FriendRequest.find({
      recipient: req.user.id,
      status: "pending",
    }).populate(
      "sender",
      "fullName profilePic nativeLanguage learningLanguage",
    );
    // Fetch requests the user sent that were accepted
    const acceptedReqs = await FriendRequest.find({
      sender: req.user.id,
      status: "accepted",
    }).populate("recipient", "fullName profilePic");
    // Sending the response
    res.status(200).json({ incomingReqs, acceptedReqs });
  } catch (error) {
    console.log("Error in getPendingFriendRequests controler", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
// Outgoing friend requests
export async function getOutgoingFriendReqs(req, res) {
  try {
    const outgoingRequests = await FriendRequest.find({
      sender: req.user.id,
      status: "pending",
    }).populate(
      "recipient",
      "fullName profilePic nativeLanguage learningLanguage",
    );
    res.status(200).json(outgoingRequests);
  } catch (error) {
    console.log("Error in getOutgoingFriendReqs controler", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
