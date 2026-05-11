import { buildHealthStatus } from "../services/healthService.js";

const getHealth = (req, res) => {
  res.success(buildHealthStatus(), "Health check passed");
};

export { getHealth };
