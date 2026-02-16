
import { Organization, Employee } from "../models/index.js";
import AuthService from "../services/auth.service.js";
import createResponse from "../utils/apiResponse.js";

class AuthController {
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const authData = await AuthService.login(res, email, password);
      createResponse(res, 200, "Login successful", authData);
    } catch (err) {
      next(err);
    }
  }

  static async employeeLogin(req, res, next) {
    try {
      const { code } = req.body;
      if (!code) {
        const error = new Error("Code is required for employee login");
        error.status = 400;
        throw error;
      }
      const authData = await AuthService.employeeLogin(res, code)
      createResponse(res, 200, "Employee login successful", authData);
    } catch (err) {
      next(err);
    }
  }

  static async logout(req, res, next) {
    try {
      AuthService.logout(res);
      createResponse(res, 200, "Logout successful");
    } catch (err) {
      next(err);
    }
  }

  static async getCurrentUser(req, res, next) {
    try {
      const { user } = req;
      if (!user) {
        const error = new Error("Unauthorized");
        error.status = 401;
        throw error;
      }
      createResponse(res, 200, "User retrieved successfully", user);
    } catch (err) {
      next(err);
    }
  }
  static async authAddSectionList(_req, res, next) {
    try {
      const orgs = await Organization.findAll({
        attributes: ['id', 'orgName']
      });
      createResponse(res, 200, "Organizations fetched successfully", { orgs });
    } catch (err) {
      next(err);
    }
  }
  static async preRegisterEmployee(req, res, next) {
    try {
      const {
        orgId,
        name,
        email,
        role,
        contactNumber,
        address,
        gender,
        dob,
        ssn,
      } = req.body;

      const employee = await Employee.create({
        name,
        email,
        role,
        contactNumber,
        address,
        gender,
        dob,
        ssn,
        orgId: orgId,
      });
      createResponse(res, 201, "Employee Registered", { employee });
    } catch (err) {
      next(err);
    }
  }
}

export default AuthController;
