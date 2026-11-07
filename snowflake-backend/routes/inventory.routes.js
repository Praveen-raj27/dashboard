
import express from "express";
import { getInventory } from "../controllers/inventory.controller.js";

const router = express.Router();

router.get("/", getInventory);

export default router;
