/* Import section */
import express from "express";

/* Router */
const router = express.Router();

/* Sign up */
router.get("/signup", (req, res) => {
  res.send("Sign up Route");
});

/* Login  */
router.get("/login", (req, res) => {
  res.send("Login Route");
});

/* Logout */
router.get("/logout", (req, res) => {
  res.send("Logout Route");
});

/* Export section */
export default router;
