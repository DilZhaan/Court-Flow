import { buildHealthStatus } from "../services/healthService.js";

const getHealth = (req, res) => {
  res.status(200).json(buildHealthStatus());
};

export { getHealth };
