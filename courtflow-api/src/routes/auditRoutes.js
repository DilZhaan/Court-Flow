import { Router } from "express";

import { ROLES } from "../constants/roles.js";
import { getAuditLogs } from "../controllers/auditController.js";
import requireRoles from "../middleware/roleMiddleware.js";

const router = Router();

router.get("/", requireRoles(ROLES.ADMIN, ROLES.MANAGER, ROLES.STAFF), getAuditLogs);

export default router;
