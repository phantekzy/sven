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
    await User.findByIdAndUpdate(friendRequest.sender, {
      $addToSet: { friends: friendRequest.recipient },
    });
    await User.findByIdAndUpdate(friendRequest.recipient, {
      $addToSet: { friends: friendRequest.sender },
    });
  } catch (error) {
    console.error(error.message);
  }
}
