import { ROLES } from "../constants/roles.js";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import { recordAuditLog } from "./auditService.js";

const initialAdminEmails = () =>
  (process.env.INITIAL_ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

const findOrCreateAuthenticatedUser = async (decodedToken) => {
  const email = decodedToken.email?.toLowerCase();

  if (!email) {
    throw new ApiError(401, "Firebase account does not include an email");
  }

  const role = initialAdminEmails().includes(email) ? ROLES.ADMIN : ROLES.STAFF;

  const user = await User.findOneAndUpdate(
    { firebaseUid: decodedToken.uid },
    {
      $setOnInsert: {
        firebaseUid: decodedToken.uid,
        email,
        displayName: decodedToken.name || "",
        role,
      },
      $set: {
        lastLoginAt: new Date(),
      },
    },
    { new: true, upsert: true, runValidators: true }
  );

  if (!user.isActive) {
    throw new ApiError(403, "User account is inactive");
  }

  return user;
};

const createUser = async (payload, actor) => {
  const exists = await User.exists({
    $or: [{ firebaseUid: payload.firebaseUid }, { email: payload.email }],
  });

  if (exists) {
    throw new ApiError(409, "User already exists");
  }

  const user = await User.create(payload);

  await recordAuditLog({
    actor: actor._id,
    action: "USER_CREATED",
    entityType: "User",
    entityId: user._id,
    metadata: { email: user.email, role: user.role },
  });

  return user;
};

const listUsers = async () => User.find().sort({ createdAt: -1 });

const updateUserRole = async ({ id, role }, actor) => {
  const user = await User.findById(id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const previousRole = user.role;
  user.role = role;
  await user.save();

  await recordAuditLog({
    actor: actor._id,
    action: "USER_ROLE_UPDATED",
    entityType: "User",
    entityId: user._id,
    metadata: { previousRole, role },
  });

  return user;
};

const updateUserStatus = async ({ id, isActive }, actor) => {
  const user = await User.findById(id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const previousStatus = user.isActive;
  user.isActive = isActive;
  await user.save();

  await recordAuditLog({
    actor: actor._id,
    action: "USER_STATUS_UPDATED",
    entityType: "User",
    entityId: user._id,
    metadata: { previousStatus, isActive },
  });

  return user;
};

export {
  createUser,
  findOrCreateAuthenticatedUser,
  listUsers,
  updateUserRole,
  updateUserStatus,
};
