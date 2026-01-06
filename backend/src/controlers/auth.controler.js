/* Import section */
import User from "../models/User.js";
import jwt from "jsonwebtoken";
/* Routes Control */
/* Sign up */
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
    const newUser = new User.create({
      fullName,
      email,
      password,
      profilePic: randomAvatar,
    });
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
/* Login  */
export async function Login(req, res) {
  res.send("Login Route");
}
/* Logout */
export function Logout(req, res) {
  res.send("Logout Route");
}
