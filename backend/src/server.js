/* Import section */
import express from "express";
import "dotenv/config";
import authRoutes from "./routes/auth.route.js";
/* Express app */
const app = express();
const PORT = process.env.PORT;

app.use("/api/auth", authRoutes);

/* Listening */
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
