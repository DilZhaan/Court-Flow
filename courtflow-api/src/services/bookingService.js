import mongoose from "mongoose";

import { BOOKING_STATUS } from "../constants/bookingStatus.js";
import { FACILITY_STATUS } from "../constants/facilityStatus.js";
import Booking from "../models/Booking.js";
import Facility from "../models/Facility.js";
import ApiError from "../utils/ApiError.js";
import { ROLES } from "../constants/roles.js";
import { recordAuditLog } from "./auditService.js";

const maxTransactionRetries = 3;

const isTransientTransactionError = (error) =>
  typeof error.hasErrorLabel === "function" &&
  (error.hasErrorLabel("TransientTransactionError") ||
    error.hasErrorLabel("UnknownTransactionCommitResult"));

const isTransactionNotSupported = (error) =>
  typeof error?.message === "string" &&
  /Transaction numbers are only allowed on a replica set member or mongos|Transactions are not supported/i.test(
    error.message,
  );

const withSession = (query, session) =>
  session ? query.session(session) : query;

const assertFacilityIsBookable = async (facilityId, session = null) => {
  const facility = await withSession(Facility.findById(facilityId), session);

  if (!facility) {
    throw new ApiError(404, "Facility not found");
  }

  if (facility.status !== FACILITY_STATUS.AVAILABLE) {
    throw new ApiError(409, "Facility is not available for booking");
  }

  return facility;
};

const findOverlappingBooking = async (
  { facility, startAt, endAt },
  session = null,
) =>
  withSession(
    Booking.findOne({
      facility,
      status: BOOKING_STATUS.ACTIVE,
      startAt: { $lt: endAt },
      endAt: { $gt: startAt },
    }),
    session,
  );

const runBookingFlow = async (payload, actor, session = null) => {
  const facility = await assertFacilityIsBookable(payload.facility, session);

  const updateOptions = session ? { session } : undefined;
  await Facility.updateOne(
    { _id: facility._id },
    { $inc: { bookingRevision: 1 } },
    updateOptions,
  );

  const overlap = await findOverlappingBooking(payload, session);

  if (overlap) {
    throw new ApiError(
      409,
      "Facility already has an active booking for this time slot",
    );
  }

  const createOptions = session ? { session } : undefined;
  const [booking] = await Booking.create(
    [
      {
        ...payload,
        bookedBy: actor._id,
      },
    ],
    createOptions,
  );

  return booking;
};

const runBookingTransaction = async (payload, actor) => {
  const session = await mongoose.startSession();

  try {
    let createdBooking;

    await session.withTransaction(async () => {
      createdBooking = await runBookingFlow(payload, actor, session);
    });

    return createdBooking;
  } finally {
    await session.endSession();
  }
};

const createBooking = async (payload, actor) => {
  let createdBooking;

  for (let attempt = 1; attempt <= maxTransactionRetries; attempt += 1) {
    try {
      createdBooking = await runBookingTransaction(payload, actor);
      break;
    } catch (error) {
      if (isTransactionNotSupported(error)) {
        createdBooking = await runBookingFlow(payload, actor);
        break;
      }
      if (
        !isTransientTransactionError(error) ||
        attempt === maxTransactionRetries
      ) {
        throw error;
      }
    }
  }

  await recordAuditLog({
    actor: actor._id,
    action: "BOOKING_CREATED",
    entityType: "Booking",
    entityId: createdBooking._id,
    metadata: {
      facility: payload.facility,
      clientName: payload.clientName,
      startAt: payload.startAt,
      endAt: payload.endAt,
    },
  });

  return Booking.findById(createdBooking._id)
    .populate("facility", "code name location sportType")
    .populate("bookedBy", "email displayName role");
};

const listBookings = async (filters = {}, actor) => {
  const query = {};

  if (actor?.role === ROLES.STAFF) {
    query.bookedBy = actor._id;
  }

  if (filters.facility) {
    query.facility = filters.facility;
  }

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.from || filters.to) {
    query.startAt = {};
  }

  if (filters.from) {
    query.startAt.$gte = filters.from;
  }

  if (filters.to) {
    query.startAt.$lte = filters.to;
  }

  return Booking.find(query)
    .populate("facility", "code name location sportType")
    .populate("bookedBy", "email displayName role")
    .populate("cancelledBy", "email displayName role")
    .sort({ startAt: -1 });
};

const getBookingById = async (id, actor) => {
  const booking = await Booking.findById(id)
    .populate("facility", "code name location sportType")
    .populate("bookedBy", "email displayName role")
    .populate("cancelledBy", "email displayName role");

  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  if (
    actor?.role === ROLES.STAFF &&
    !booking.bookedBy?._id?.equals(actor._id)
  ) {
    throw new ApiError(403, "You do not have permission to view this booking");
  }

  return booking;
};

const cancelBooking = async ({ id, cancellationReason }, actor) => {
  const booking = await Booking.findById(id);

  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  if (actor?.role === ROLES.STAFF && !booking.bookedBy?.equals(actor._id)) {
    throw new ApiError(
      403,
      "You do not have permission to cancel this booking",
    );
  }

  if (booking.status === BOOKING_STATUS.CANCELLED) {
    throw new ApiError(409, "Booking is already cancelled");
  }

  booking.status = BOOKING_STATUS.CANCELLED;
  booking.cancelledBy = actor._id;
  booking.cancelledAt = new Date();
  booking.cancellationReason = cancellationReason;
  await booking.save();

  await recordAuditLog({
    actor: actor._id,
    action: "BOOKING_CANCELLED",
    entityType: "Booking",
    entityId: booking._id,
    metadata: { clientName: booking.clientName, cancellationReason },
  });

  return getBookingById(booking._id, actor);
};

export { cancelBooking, createBooking, getBookingById, listBookings };
