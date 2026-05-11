import { listAuditLogs } from "../services/auditService.js";
import asyncHandler from "../utils/asyncHandler.js";

const getAuditLogs = asyncHandler(async (req, res) => {
  const logs = await listAuditLogs(req.query, req.user);

  res.success(logs, "Audit logs fetched");
});

export { getAuditLogs };
