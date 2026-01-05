/* Import section */
import express from "express";
import "dotenv/config";
import authRoutes from "./routes/auth.route.js";
import { connectDB } from "./lib/db.js";
/* Express app */
const app = express();
const PORT = process.env.PORT;
/* Routes */
app.use("/api/auth", authRoutes);
/* Listening */
app.listen(PORT, () => {
  console.log(`Sven Server is running on port ${PORT}`);
  connectDB();
});
