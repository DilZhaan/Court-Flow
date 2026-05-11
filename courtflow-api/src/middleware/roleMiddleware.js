import ApiError from "../utils/ApiError.js";

const requireRoles = (...roles) => (req, res, next) => {
  if (!req.user) {
    next(new ApiError(401, "Authentication required"));
    return;
  }

  if (!roles.includes(req.user.role)) {
    next(new ApiError(403, "You do not have permission to perform this action"));
    return;
  }

  next();
};

export default requireRoles;
