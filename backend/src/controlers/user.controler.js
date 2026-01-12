/* Import section */
import User from "../models/User.js";

/* Recommended users  section*/
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
