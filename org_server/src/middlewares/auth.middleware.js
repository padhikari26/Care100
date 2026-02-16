import AuthService from "../services/auth.service.js";
import createResponse from "../utils/apiResponse.js";
import { USER_TYPES } from "../utils/constants.js";

const auth = (requiredUserTypes = []) => {
  return async (req, res, next) => {
    try {
      const token = req.cookies.authToken || req.headers.authorization?.split(" ")[1];
      if (!token) {
        throw new createResponse(res, 401, "Authentication token is missing");
      }
      const decoded = await AuthService.verifyToken(res, token);
      req.user = decoded;
      if (
        requiredUserTypes.length &&
        !requiredUserTypes.includes(decoded.userType)
      ) {
        throw new createResponse(res, 403, "Insufficient permissions");
      }
      next();
    } catch (err) {
      next(err);
    }
  };
};

export default {
  auth,
  superAdminAuth: auth([USER_TYPES.SUPER_ADMIN]),
  orgAdminAuth: auth([USER_TYPES.ORGANIZATION, USER_TYPES.SUPER_ADMIN]),
  employeeAuth: auth([
    USER_TYPES.EMPLOYEE,
    USER_TYPES.ORGANIZATION,
    USER_TYPES.SUPER_ADMIN,
  ]),
};
