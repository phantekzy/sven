/* Import section */
import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getStreamToken } from "../controlers/chat.controler.js";
/* Router */
const router = express.Router();
router.get("/token", protectRoute, getStreamToken);
/* Export section */
export default router;
