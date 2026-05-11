import { FACILITY_STATUS_VALUES } from "../constants/facilityStatus.js";
import {
  assertValid,
  normalizeString,
  optionalString,
  parseDate,
  requireNumber,
  requireObjectId,
  requireString,
} from "./validators.js";

const buildFacilityPayload = (body, partial = false) => {
  const errors = {};
  const payload = {};

  const assignString = (field) => {
    if (!partial || body[field] !== undefined) {
      payload[field] = requireString(body, field, errors);
    }
  };

  assignString("code");
  assignString("name");
  assignString("location");
  assignString("sportType");

  if (!partial || body.capacity !== undefined) {
    payload.capacity = requireNumber(body, "capacity", errors, 1);
  }

  if (!partial || body.pricePerHour !== undefined) {
    payload.pricePerHour = requireNumber(body, "pricePerHour", errors, 0);
  }

  if (!partial || body.status !== undefined) {
    const status = normalizeString(body.status);
    if (!FACILITY_STATUS_VALUES.includes(status)) {
      errors.status = `status must be one of ${FACILITY_STATUS_VALUES.join(", ")}`;
    } else {
      payload.status = status;
    }
  }

  if (!partial || body.notes !== undefined) {
    payload.notes = optionalString(body, "notes");
  }

  assertValid(errors);

  return payload;
};

const createFacilityDto = (body) => buildFacilityPayload(body);

const updateFacilityDto = (body) => buildFacilityPayload(body, true);

const facilitySearchDto = (query) => {
  const errors = {};
  const dto = {};

  if (query.location) {
    dto.location = normalizeString(query.location);
  }

  if (query.capacity) {
    dto.capacity = requireNumber(query, "capacity", errors, 1);
  }

  if (query.search) {
    dto.search = normalizeString(query.search);
  }

  if (query.startAt || query.endAt) {
    dto.startAt = parseDate(query.startAt, "startAt", errors);
    dto.endAt = parseDate(query.endAt, "endAt", errors);
  }

  if (dto.startAt && dto.endAt && dto.startAt >= dto.endAt) {
    errors.endAt = "endAt must be after startAt";
  }

  assertValid(errors);

  return dto;
};

const facilityIdDto = (params) => {
  const errors = {};
  const id = requireObjectId(params.id, "id", errors);

  assertValid(errors);

  return { id };
};

export { createFacilityDto, facilityIdDto, facilitySearchDto, updateFacilityDto };
