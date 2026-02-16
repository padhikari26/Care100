import { Client, Employee, Work, WorkAssignment } from "../models/index.js";
import createResponse from "../utils/apiResponse.js";
import { USER_TYPES } from "../utils/constants.js";
import { paginate } from "../utils/paginate.js";

class EmployeeController {
  static async getEmployeeAssignedWorks(req, res, next) {
    try {
      let employeeId;
      if (req.user.userType === USER_TYPES.EMPLOYEE) {
        employeeId = req.user.id;
      } else {
        employeeId = req.query.employeeId;
      }

      const employee = await Employee.findByPk(employeeId);
      if (!employee) {
        const error = new Error("Employee not found");
        error.status = 404;
        throw error;
      }

      if (
        req.user.userType === USER_TYPES.ORGANIZATION &&
        employee.orgId !== req.user.orgId
      ) {
        const error = new Error(
          "Unauthorized: Employee not in your organization"
        );
        error.status = 403;
        throw error;
      }

      if (
        req.user.userType === USER_TYPES.EMPLOYEE &&
        req.user.id !== employeeId
      ) {
        const error = new Error(
          "Unauthorized: Cannot access other employees' assignments"
        );
        error.status = 403;
        throw error;
      }

      const { page = 1, limit = 10 } = req.query;

      const { data: works, pagination } = await paginate(
        WorkAssignment,
        {
          where: { employeeId },
          include: [
            { model: Work, attributes: ["name", "description"] },
            { model: Client, attributes: ["name"] },
          ],
        },
        { page: Number.parseInt(page), limit: Number.parseInt(limit) }
      );

      createResponse(res, 200, "Assigned works retrieved", works, pagination);
    } catch (err) {
      next(err);
    }
  }

  static async getEmployeeClients(req, res, next) {
    try {
      let employeeId;
      if (req.user.userType === USER_TYPES.EMPLOYEE) {
        employeeId = req.user.id;
      } else {
        employeeId = req.query.employeeId;
      }

      const employee = await Employee.findByPk(employeeId);
      if (!employee) {
        const error = new Error("Employee not found");
        error.status = 404;
        throw error;
      }

      if (
        req.user.userType === USER_TYPES.ORGANIZATION &&
        employee.orgId !== req.user.orgId
      ) {
        const error = new Error(
          "Unauthorized: Employee not in your organization"
        );
        error.status = 403;
        throw error;
      }

      if (
        req.user.userType === USER_TYPES.EMPLOYEE &&
        req.user.id !== employeeId
      ) {
        const error = new Error(
          "Unauthorized: Cannot access other employees' clients"
        );
        error.status = 403;
        throw error;
      }

      const { page = 1, limit = 10 } = req.query;

      const { data: clients, pagination } = await paginate(
        Client,
        {
          include: [
            {
              model: WorkAssignment,
              where: { employeeId },
              attributes: [],
            },
          ],
          attributes: [
            "id",
            "name",
            "orgId",
            "contactNumber",
            "email",
            "createdAt",
            "updatedAt",
          ],
        },
        { page: Number.parseInt(page), limit: Number.parseInt(limit) }
      );

      createResponse(res, 200, "Clients retrieved", clients, pagination);
    } catch (err) {
      next(err);
    }
  }
}

export default EmployeeController;
