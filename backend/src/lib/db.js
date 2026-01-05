/* Import section */
import mongoose from "mongoose";
/* Connect to mongo DB */
export const connectDB = async () => {
  try {
    /* Connection */
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected : ${conn.connection.host}`);
  } catch (error) {
    console.log("Can not connect to MongoDB ", error);
    /* in a failure case  */
    process.exit(1);
  }
};
