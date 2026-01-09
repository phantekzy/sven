/* Import section */
import express from "express";
import "dotenv/config";
import authRoutes from "./routes/auth.route.js";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";
/* Express app */
const app = express();
const PORT = process.env.PORT;
/* Package JSON */
app.use(express.json());
/* Cookies */
app.use(cookieParser());
/* Routes */
app.use("/api/auth", authRoutes);
/* Listening */
app.listen(PORT, () => {
  console.log(`Sven Server is running on port ${PORT}`);
  connectDB();
});
