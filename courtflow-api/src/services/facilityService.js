import { BOOKING_STATUS } from "../constants/bookingStatus.js";
import { FACILITY_STATUS } from "../constants/facilityStatus.js";
import Booking from "../models/Booking.js";
import Facility from "../models/Facility.js";
import ApiError from "../utils/ApiError.js";
import { recordAuditLog } from "./auditService.js";

const facilityConflictMessage = "Facility code already exists";

const buildFacilityQuery = (filters = {}) => {
  const query = {};

  if (filters.location) {
    query.location = new RegExp(filters.location, "i");
  }

  if (filters.capacity) {
    query.capacity = { $gte: filters.capacity };
  }

  if (filters.search) {
    query.$text = { $search: filters.search };
  }

  return query;
};

const findBookedFacilityIds = async ({ startAt, endAt }) => {
  const bookings = await Booking.find({
    status: BOOKING_STATUS.ACTIVE,
    startAt: { $lt: endAt },
    endAt: { $gt: startAt },
  }).select("facility");

  return bookings.map((booking) => booking.facility);
};

const findBookedFacilityIdsAt = async (date) =>
  Booking.find({
    status: BOOKING_STATUS.ACTIVE,
    startAt: { $lt: date },
    endAt: { $gt: date },
  }).distinct("facility");

const createFacility = async (payload, actor) => {
  const exists = await Facility.exists({ code: payload.code.toUpperCase() });

  if (exists) {
    throw new ApiError(409, facilityConflictMessage);
  }

  const facility = await Facility.create(payload);

  await recordAuditLog({
    actor: actor._id,
    action: "FACILITY_CREATED",
    entityType: "Facility",
    entityId: facility._id,
    metadata: { code: facility.code },
  });

  return facility;
};

const listFacilities = async (filters = {}) => {
  const query = buildFacilityQuery(filters);

  if (filters.startAt && filters.endAt) {
    const bookedFacilityIds = await findBookedFacilityIds(filters);
    query._id = { $nin: bookedFacilityIds };
    query.status = FACILITY_STATUS.AVAILABLE;
  }

  const facilities = await Facility.find(query)
    .sort({ location: 1, name: 1 })
    .lean();

  const bookedNowIds = await findBookedFacilityIdsAt(new Date());
  const bookedNowSet = new Set(bookedNowIds.map((id) => id.toString()));

  return facilities.map((facility) => ({
    ...facility,
    isBooked: bookedNowSet.has(facility._id.toString()),
  }));
};

const getFacilityById = async (id) => {
  const facility = await Facility.findById(id);

  if (!facility) {
    throw new ApiError(404, "Facility not found");
  }

  return facility;
};

const updateFacility = async (id, payload, actor) => {
  const facility = await Facility.findById(id);

  if (!facility) {
    throw new ApiError(404, "Facility not found");
  }

  if (payload.code && payload.code.toUpperCase() !== facility.code) {
    const exists = await Facility.exists({ code: payload.code.toUpperCase() });

    if (exists) {
      throw new ApiError(409, facilityConflictMessage);
    }
  }

  Object.assign(facility, payload);
  await facility.save();

  await recordAuditLog({
    actor: actor._id,
    action: "FACILITY_UPDATED",
    entityType: "Facility",
    entityId: facility._id,
    metadata: { code: facility.code, name: facility.name, changes: payload },
  });

  return facility;
};

const removeFacility = async (id, actor) => {
  const facility = await Facility.findById(id);

  if (!facility) {
    throw new ApiError(404, "Facility not found");
  }

  const activeBooking = await Booking.exists({
    facility: id,
    status: BOOKING_STATUS.ACTIVE,
  });

  if (activeBooking) {
    throw new ApiError(409, "Facility has active bookings");
  }

  await facility.deleteOne();

  await recordAuditLog({
    actor: actor._id,
    action: "FACILITY_DELETED",
    entityType: "Facility",
    entityId: facility._id,
    metadata: { code: facility.code },
  });
};

export {
  createFacility,
  getFacilityById,
  listFacilities,
  removeFacility,
  updateFacility,
};
