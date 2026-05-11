import { Router } from "express";

import { ROLES } from "../constants/roles.js";
import {
  deleteFacility,
  getFacilities,
  getFacility,
  patchFacility,
  postFacility,
} from "../controllers/facilityController.js";
import requireRoles from "../middleware/roleMiddleware.js";

const router = Router();

router
  .route("/")
  .get(requireRoles(ROLES.MANAGER, ROLES.STAFF), getFacilities)
  .post(requireRoles(ROLES.MANAGER), postFacility);

router
  .route("/:id")
  .get(requireRoles(ROLES.MANAGER, ROLES.STAFF), getFacility)
  .patch(requireRoles(ROLES.MANAGER), patchFacility)
  .delete(requireRoles(ROLES.MANAGER), deleteFacility);

export default router;
