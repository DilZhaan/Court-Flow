import logger from "../utils/logger.js";

const errorHandler = (err, req, res, next) => {
  const statusCode =
    err.statusCode || (res.statusCode && res.statusCode !== 200 ? res.statusCode : 500);

  if (statusCode >= 500) {
    logger.error("Unhandled request error", {
      error: err,
      method: req.method,
      path: req.originalUrl,
      userId: req.user?._id?.toString(),
    });
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || "Server error",
    details: err.details,
  });
};

export default errorHandler;
