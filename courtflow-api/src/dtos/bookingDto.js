import {
  assertValid,
  normalizeString,
  optionalString,
  parseDate,
  requireObjectId,
  requireString,
} from "./validators.js";

const createBookingDto = (body) => {
  const errors = {};

  const dto = {
    facility: requireObjectId(body.facilityId, "facilityId", errors),
    clientName: requireString(body, "clientName", errors),
    sessionType: optionalString(body, "sessionType"),
    startAt: parseDate(body.startAt, "startAt", errors),
    endAt: parseDate(body.endAt, "endAt", errors),
    notes: optionalString(body, "notes"),
  };

  if (dto.startAt && dto.endAt && dto.startAt >= dto.endAt) {
    errors.endAt = "endAt must be after startAt";
  }

  assertValid(errors);

  return dto;
};

const cancelBookingDto = (params, body) => {
  const errors = {};
  const id = requireObjectId(params.id, "id", errors);
  const cancellationReason = optionalString(body, "cancellationReason");

  assertValid(errors);

  return { id, cancellationReason };
};

const bookingIdDto = (params) => {
  const errors = {};
  const id = requireObjectId(params.id, "id", errors);

  assertValid(errors);

  return { id };
};

const bookingQueryDto = (query) => {
  const errors = {};
  const dto = {};

  if (query.facilityId) {
    dto.facility = requireObjectId(query.facilityId, "facilityId", errors);
  }

  if (query.status) {
    dto.status = normalizeString(query.status);
  }

  if (query.from) {
    dto.from = parseDate(query.from, "from", errors);
  }

  if (query.to) {
    dto.to = parseDate(query.to, "to", errors);
  }

  if (dto.from && dto.to && dto.from > dto.to) {
    errors.to = "to must be after from";
  }

  assertValid(errors);

  return dto;
};

export { bookingIdDto, bookingQueryDto, cancelBookingDto, createBookingDto };
