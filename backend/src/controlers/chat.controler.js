/* Import section */
import { generateStreamToken } from "../lib/stream.js";
/* Get Stream token function */
export async function getStreamToken(req, res) {
  try {
    const token = generateStreamToken(req.user.id);
    res.status(200).json({ token });
  } catch (error) {
    console.log("Error in getStreamToken controler", error.message);
    res.stauts(500).json({ message: "Internal Server Error" });
  }
}
