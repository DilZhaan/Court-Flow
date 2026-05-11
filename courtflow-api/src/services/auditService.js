import { ROLES } from "../constants/roles.js";
import AuditLog from "../models/AuditLog.js";
import User from "../models/User.js";
import logger from "../utils/logger.js";

const managerVisibleRoles = [ROLES.MANAGER, ROLES.STAFF];

const recordAuditLog = async ({ actor, action, entityType, entityId, metadata = {} }) => {
  try {
    await AuditLog.create({
      actor: actor || null,
      action,
      entityType,
      entityId: entityId || null,
      metadata,
    });
  } catch (error) {
    logger.error("Failed to write audit log", { error });
  }
};

const buildActorScope = async (actor) => {
  if (!actor || actor.role === ROLES.ADMIN) {
    return undefined;
  }

  if (actor.role === ROLES.STAFF) {
    return [actor._id];
  }

  const visibleUsers = await User.find({ role: { $in: managerVisibleRoles } }).select("_id");
  return visibleUsers.map((user) => user._id);
};

const listAuditLogs = async (filters = {}, actor = null) => {
  const query = {};
  const actorScope = await buildActorScope(actor);

  if (actorScope) {
    query.actor = { $in: actorScope };
  }

  if (filters.entityType) {
    query.entityType = filters.entityType;
  }

  if (filters.entityId) {
    query.entityId = filters.entityId;
  }

  return AuditLog.find(query)
    .populate("actor", "email displayName role")
    .sort({ createdAt: -1 })
    .limit(200);
};

export { listAuditLogs, recordAuditLog };
