import express from "express";
import {
  forgotPassword,
  resetPassword,
} from "../controllers/passwordReset.controller.js";

const router = express.Router();

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;