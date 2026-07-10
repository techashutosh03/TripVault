import express from "express";
import { getRates, convertCurrency } from "../controllers/currencyController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply auth middleware to all currency routes
router.use(authMiddleware);

router.get("/rates", getRates);
router.post("/convert", convertCurrency);

export default router;
