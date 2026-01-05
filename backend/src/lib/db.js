/* Import section */
import mongoose from "mongoose";
/* Connection to MongoDB */
export const connectDB = async () => {
  console.log("Attempting to connect to MongoDB...");
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected : ${conn.connection.host}`);
  } catch (error) {
    console.log("Can not connect to MongoDB sven sever ", error.message);
    process.exit(1);
  }
};
