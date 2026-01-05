/* Import section */
import mongoose from "mongoose";
/* Connect to mongo DB */
export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
  } catch (error) {}
};
