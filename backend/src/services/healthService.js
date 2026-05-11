const buildHealthStatus = () => ({
  status: "ok",
  timestamp: new Date().toISOString(),
});

export { buildHealthStatus };
