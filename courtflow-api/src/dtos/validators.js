import mongoose from "mongoose";

import ApiError from "../utils/ApiError.js";

const isBlank = (value) => typeof value !== "string" || value.trim().length === 0;

const normalizeString = (value) => (typeof value === "string" ? value.trim() : value);

const requireString = (body, field, errors) => {
  const value = normalizeString(body[field]);

  if (isBlank(value)) {
    errors[field] = `${field} is required`;
    return undefined;
  }

  return value;
};

const optionalString = (body, field) => {
  const value = normalizeString(body[field]);
  return typeof value === "string" ? value : "";
};

const requireNumber = (body, field, errors, min = undefined) => {
  const value = Number(body[field]);

  if (!Number.isFinite(value)) {
    errors[field] = `${field} must be a number`;
    return undefined;
  }

  if (min !== undefined && value < min) {
    errors[field] = `${field} must be at least ${min}`;
    return undefined;
  }

  return value;
};

const requireObjectId = (value, field, errors) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    errors[field] = `${field} must be a valid id`;
    return undefined;
  }

  return value;
};

const parseDate = (value, field, errors) => {
  const date = new Date(value);

  if (!value || Number.isNaN(date.getTime())) {
    errors[field] = `${field} must be a valid date`;
    return undefined;
  }

  return date;
};

const assertValid = (errors) => {
  if (Object.keys(errors).length > 0) {
    throw new ApiError(400, "Validation failed", errors);
  }
};

export {
  assertValid,
  normalizeString,
  optionalString,
  parseDate,
  requireNumber,
  requireObjectId,
  requireString,
};
