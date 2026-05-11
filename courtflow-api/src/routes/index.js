import { Router } from "express";

import authenticate from "../middleware/authMiddleware.js";
import auditRoutes from "./auditRoutes.js";
import bookingRoutes from "./bookingRoutes.js";
import facilityRoutes from "./facilityRoutes.js";
import healthRoutes from "./healthRoutes.js";
import userRoutes from "./userRoutes.js";

const router = Router();

router.use("/health", healthRoutes);
router.use("/users", authenticate, userRoutes);
router.use("/facilities", authenticate, facilityRoutes);
router.use("/bookings", authenticate, bookingRoutes);
router.use("/audit-logs", authenticate, auditRoutes);

export default router;
