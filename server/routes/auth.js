import express from "express";
import { signup, login, refresh, signout, signInWithGoogle } from "../controllers/auth.js";
import loginLimiter from "../middleware/loginLimiter.js";
const router = express.Router();

//Sign up
router.post("/signup", signup);

//Login
router.post("/login", loginLimiter, login);

//Refresh token
router.get("/refresh", refresh);

//Sign out
router.post("signout", signout);

//Sign in with google
router.post("/google", signInWithGoogle);
export default router; 
