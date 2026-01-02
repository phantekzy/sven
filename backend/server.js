/* Import section */
import express from "express";
import "dotenv/config";

/* Dotnev configuration */
dotenv.config();
/* Express app */
const app = express();
const PORT = process.env.PORT;
/* Endpoints */
// Sign up
app.get("/api/auth/signup", (req, res) => {
  res.send("Sign Route");
});
// Login
app.get("/api/auth/login", (req, res) => {
  res.send("Login Route");
});
// Logout
app.get("/api/auth/logout", (req, res) => {
  res.send("Logout Route");
});
/* Listening */
app.listen(`Server is running on port ${PORT}`);
