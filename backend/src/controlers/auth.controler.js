/* Import section */
import { upsertStreamUser } from "../lib/stream.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
/* Routes Control */

/*  ------- SIGN UP SECTION --------  */
export async function Signup(req, res) {
  /* Entry point */
  const { email, password, fullName } = req.body;
  try {
    /* Conditions */
    if (!email || !password || !fullName) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }
    /* Password length  */
    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }
    /* Regular expresion */
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }
    /* Existing email  */
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists , use a different email please!",
      });
    }
    /* Profile pic generator */
    const index = Math.floor(Math.random() * 100) + 1;
    const randomAvatar = `https://avatar.iran.liara.run/public/${index}.png`;
    /* New user creation */
    const newUser = await User.create({
      fullName,
      email,
      password,
      profilePic: randomAvatar,
    });

    /* Create Stream user */
    try {
      await upsertStreamUser({
        id: newUser._id.toString(),
        name: newUser.fullName,
        image: newUser.profilePic || "",
      });
      console.log(`Stream user has been created for ${newUser.fullName}`);
    } catch (error) {
      console.log("Error creating Stream user", error);
    }

    /* JWT token */
    const token = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "7d",
      },
    );
    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });
    /* Creation */
    res.status(201).json({
      success: true,
      user: newUser,
    });
  } catch (error) {
    console.log("Error in Signup controler ");
    res.status(500).json({
      message: "Internal Error",
    });
  }
}

/* ------- LOG IN SECTION ----------  */
export async function Login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        message: "All fields are required !",
      });
    }
    const user = await User.findOne({ email });
    if (!user)
      /* Match email */
      return res.status(401).json({ message: "Invalid email or password" });
    /* Match password */
    const isPasswordCorrect = await user.matchPassword(password);
    if (!isPasswordCorrect)
      return res.status(401).json({ message: "Invalid email or password" });
    /* Create a token */
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "7d",
    });
    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });
    res.status(200).json({ success: true, user });
  } catch (error) {
    console.log("Error in login controler", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

/* ------ LOGOUT SECTION -------*/
export function Logout(req, res) {
  try {
    res.clearCookie("jwt", {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });
    res.status(200).json({ success: true, message: "logout successfully" });
  } catch (error) {
    console.log("Error in logout controler", error.message);
    res.status(500).json({ message: "Internel server Error" });
  }
}
