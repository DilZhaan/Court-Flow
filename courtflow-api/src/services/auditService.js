import AuditLog from "../models/AuditLog.js";
import logger from "../utils/logger.js";

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

const listAuditLogs = async (filters = {}) => {
  const query = {};

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
