import express from "express";
import { getUserById, updateUser } from "../controllers/users.js";
const router = express.Router();

router.get("/find/:id", getUserById);
router.put("/update", updateUser);

export default router;
