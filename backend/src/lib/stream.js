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
    await streamClient.upsertUser([userData]);
    return userData;
  } catch (error) {
    console.error("Error upserting Stream user", error);
  }
};

/* Generating Stream Token */
// Inchalah i dont ferget it
export const generateStreamToken = (userId) => {};
