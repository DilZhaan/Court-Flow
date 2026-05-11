import { Router } from "express";

import { ROLES } from "../constants/roles.js";
import {
  getMe,
  getUsers,
  patchUserRole,
  patchUserStatus,
  postUser,
} from "../controllers/userController.js";
import requireRoles from "../middleware/roleMiddleware.js";

const router = Router();

router.get("/me", getMe);

router
  .route("/")
  .get(requireRoles(ROLES.ADMIN, ROLES.MANAGER), getUsers)
  .post(requireRoles(ROLES.ADMIN), postUser);

router.patch("/:id/role", requireRoles(ROLES.ADMIN, ROLES.MANAGER), patchUserRole);
router.patch("/:id/status", requireRoles(ROLES.ADMIN), patchUserStatus);

export default router;
