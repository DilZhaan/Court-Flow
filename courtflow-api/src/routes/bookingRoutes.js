import { Router } from "express";

import { ROLES } from "../constants/roles.js";
import {
  cancelBookingById,
  getBooking,
  getBookings,
  postBooking,
} from "../controllers/bookingController.js";
import requireRoles from "../middleware/roleMiddleware.js";

const router = Router();

router
  .route("/")
  .get(requireRoles(ROLES.MANAGER, ROLES.STAFF), getBookings)
  .post(requireRoles(ROLES.MANAGER, ROLES.STAFF), postBooking);

router
  .route("/:id")
  .get(requireRoles(ROLES.MANAGER, ROLES.STAFF), getBooking);

router.patch(
  "/:id/cancel",
  requireRoles(ROLES.MANAGER, ROLES.STAFF),
  cancelBookingById
);

export default router;
