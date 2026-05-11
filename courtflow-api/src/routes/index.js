import { Router } from "express";

import authenticate from "../middleware/authMiddleware.js";
import auditRoutes from "./auditRoutes.js";
import bookingRoutes from "./bookingRoutes.js";
import facilityRoutes from "./facilityRoutes.js";
import healthRoutes from "./healthRoutes.js";
import userRoutes from "./userRoutes.js";

const router = Router();

router.use("/health", healthRoutes);

export default router;
