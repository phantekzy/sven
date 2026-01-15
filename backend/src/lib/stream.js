/* Import section */
import { StreamChat } from "stream-chat";
import "dotenv/config";

/* STREAM API KEYS */
const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

/* Missing API condition */
if (!apiKey || !apiSecret) {
  console.error("Stream api key or Stream api secret is missing");
}

/* Stream client section */
const streamClient = StreamChat.getInstance(apiKey, apiSecret);
/* Create or Update Stream users function  */
export const upsertStreamUser = async (userData) => {
  try {
    await streamClient.upsertUsers([userData]);
    return userData;
  } catch (error) {
    console.error("Error upserting Stream user", error);
  }
};

/* Generating Stream Token */
export const generateStreamToken = (userId) => {
  try {
    // Convert the userId to a string
    const userIdStr = userId.toString();
    // Generate the token
    return streamClient.createToken(userIdStr);
  } catch (error) {
    console.log("Error generating Strean Token", error);
  }
};
