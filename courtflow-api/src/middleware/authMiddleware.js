import firebaseAdmin from "../config/firebase.js";
import { findOrCreateAuthenticatedUser } from "../services/userService.js";
import ApiError from "../utils/ApiError.js";

const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");

    if (scheme !== "Bearer" || !token) {
      throw new ApiError(401, "Missing bearer token");
    }

    const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
    req.user = await findOrCreateAuthenticatedUser(decodedToken);
    req.firebaseUser = decodedToken;
    next();
  } catch (error) {
    next(error.statusCode ? error : new ApiError(401, "Invalid or expired token"));
  }
};

export default authenticate;
