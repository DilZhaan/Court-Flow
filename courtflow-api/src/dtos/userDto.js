import { ROLE_VALUES } from "../constants/roles.js";
import {
  assertValid,
  normalizeString,
  requireObjectId,
  requireString,
} from "./validators.js";

const updateUserRoleDto = (params, body) => {
  const errors = {};
  const id = requireObjectId(params.id, "id", errors);
  const role = normalizeString(body.role);

  if (!ROLE_VALUES.includes(role)) {
    errors.role = `role must be one of ${ROLE_VALUES.join(", ")}`;
  }

  assertValid(errors);

  return { id, role };
};

const updateUserStatusDto = (params, body) => {
  const errors = {};
  const id = requireObjectId(params.id, "id", errors);

  if (typeof body.isActive !== "boolean") {
    errors.isActive = "isActive must be a boolean";
  }

  assertValid(errors);

  return { id, isActive: body.isActive };
};

const createUserDto = (body) => {
  const errors = {};
  const role = normalizeString(body.role);

  const dto = {
    firebaseUid: requireString(body, "firebaseUid", errors),
    email: requireString(body, "email", errors)?.toLowerCase(),
    displayName: normalizeString(body.displayName) || "",
    role,
    isActive: body.isActive !== undefined ? body.isActive : true,
  };

  if (!ROLE_VALUES.includes(role)) {
    errors.role = `role must be one of ${ROLE_VALUES.join(", ")}`;
  }

  if (typeof dto.isActive !== "boolean") {
    errors.isActive = "isActive must be a boolean";
  }

  assertValid(errors);

  return dto;
};

export { createUserDto, updateUserRoleDto, updateUserStatusDto };
