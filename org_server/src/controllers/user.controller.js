import { compare, hash } from "bcryptjs";
import { Client, Employee, Organization, SuperAdmin, Timesheet, Work } from "../models/index.js";
import createResponse from "../utils/apiResponse.js";
import { USER_TYPES } from "../utils/constants.js";
import { paginate } from "../utils/paginate.js";

class UserController {

  static async createSuperAdmin(req, res, next) {
    try {
      // Only allow this in development or initial setup
      if (process.env.NODE_ENV !== "development") {
        const error = new Error(
          "Super admin creation is not allowed in production"
        );
        error.status = 403;
        throw error;
      }

      const { email, password } = req.body;

      // Check if super admin already exists
      const existingAdmin = await SuperAdmin.findOne();
      if (existingAdmin) {
        const error = new Error("Super admin already exists");
        error.status = 400;
        throw error;
      }

      const hashedPassword = await hash(password, 10);
      const superAdmin = await SuperAdmin.create({
        email,
        password: hashedPassword,
      });
      createResponse(res, 201, "Super admin created", { superAdmin });
    } catch (err) {
      next(err);
    }
  }

  static async createOrganization(req, res, next) {
    try {
      const { orgName, orgType, providerId, description, email, password, expiryDate } =
        req.body;

      const logo = req.logoFilename;

      const hashedPassword = await hash(password, 10);

      const organization = await Organization.create({
        orgName,
        orgType,
        logo,
        providerId,
        description,
        email,
        password: hashedPassword,
        expiryDate
      });

      createResponse(res, 201, "Organization Created", { organization });

    } catch (err) {
      next(err);
    }
  }

  static async createEmployee(req, res, next) {
    try {
      const {
        name,
        email,
        code,
        signature,
        role,
        reportingTo,
        contactNumber,
        address,
        verified,
        gender,
        dob,
        ssn,
      } = req.body;

      const employee = await Employee.create({
        name,
        email,
        code,
        signature,
        role,
        reportingTo,
        contactNumber,
        verified,
        address,
        gender,
        dob,
        ssn,
        orgId: req.user.orgId,
      });
      createResponse(res, 201, "Employee created", { employee });
    } catch (err) {
      next(err);
    }
  }

  static async createClient(req, res, next) {
    try {
      const { name, medicalId, signature, contactNumber, email } =
        req.body;

      const client = await Client.create({
        name,
        medicalId,
        signature,
        contactNumber,
        email,
        orgId: req.user.orgId,
      });

      createResponse(res, 201, "Client created", { client });
    } catch (err) {
      next(err);
    }
  }

  static async getAllUsers(req, res, next) {
    try {
      const { userType, limit = 10, page = 1, search } = req.query;
      let data, pagination;

      if (!userType) {
        const error = new Error("User type is required");
        error.status = 400;
        throw error;
      }

      if (!["organization", "employee", "client"].includes(userType)) {
        const error = new Error("Invalid user type");
        error.status = 400;
        throw error;
      }

      if (req.user.userType === USER_TYPES.EMPLOYEE) {
        const error = new Error(
          "Unauthorized: Employees cannot access this endpoint"
        );
        error.status = 403;
        throw error;
      }

      if (
        req.user.userType === USER_TYPES.ORGANIZATION &&
        userType === USER_TYPES.ORGANIZATION
      ) {
        const error = new Error(
          "Unauthorized: Organizations cannot access this endpoint"
        );
        error.status = 403;
        throw error;
      }

      // Define search fields for each user type
      const searchFieldsMap = {
        [USER_TYPES.ORGANIZATION]: [
          "orgName",
          "email",
          "providerId",
          "orgType",
        ],
        [USER_TYPES.EMPLOYEE]: ["name", "email", "role", "contactNumber"],
        [USER_TYPES.CLIENT]: ["name", "email", "medicalId", "contactNumber"],
      };

      const searchFields = searchFieldsMap[userType] || [];

      // Add organization filter for employees and clients
      const whereCondition = {};
      if (
        req.user.userType === USER_TYPES.ORGANIZATION &&
        (userType === USER_TYPES.EMPLOYEE || userType === USER_TYPES.CLIENT)
      ) {
        whereCondition.orgId = req.user.orgId;
      }

      switch (userType) {
        case USER_TYPES.ORGANIZATION:
          ({ items: data, pagination } = await paginate(Organization, {
            limit,
            page,
            search,
            searchFields,
            where: whereCondition,
          }));
          createResponse(res, 200, "Organizations retrieved", {
            data,
            pagination,
          });
          break;
        case USER_TYPES.EMPLOYEE:
          ({ items: data, pagination } = await paginate(Employee, {
            limit,
            page,
            search,
            searchFields,
            where: whereCondition,
          }));
          createResponse(res, 200, "Employees retrieved", {
            data,
            pagination,
          });
          break;
        case USER_TYPES.CLIENT:
          ({ items: data, pagination } = await paginate(Client, {
            limit,
            page,
            search,
            searchFields,
            where: whereCondition,
          }));
          createResponse(res, 200, "Clients retrieved", {
            data,
            pagination,
          });
          break;
        default:
          const error = new Error("Invalid user type");
          error.status = 400;
          throw error;
      }
    } catch (err) {
      next(err);
    }
  }

  //update organization
  static async updateOrganization(req, res, next) {
    try {
      const { id } = req.params;
      const { orgName, orgType, logo, providerId, description, expiryDate } = req.body;

      const organization = await Organization.findByPk(id);
      if (!organization) {
        const error = new Error("Organization not found");
        error.status = 404;
        throw error;
      }

      await organization.update({
        orgName,
        orgType,
        logo,
        providerId,
        description,
        expiryDate
      });

      createResponse(res, 200, "Organization updated", { organization });
    } catch (err) {
      next(err);
    }
  }
  //update employee

  static async updateEmployee(req, res, next) {
    try {
      const { id } = req.params;
      const {
        name,
        email,
        signature,
        code,
        verified,
        role,
        reportingTo,
        contactNumber,
        address,
        gender,
        dob,
        ssn,
      } = req.body;
      const employee = await Employee.findByPk(id);
      if (!employee) {
        const error = new Error("Employee not found");
        error.status = 404;
        throw error;
      }
      await employee.update({
        name,
        email,
        signature,
        code,
        verified,
        role,
        reportingTo,
        contactNumber,
        address,
        gender,
        dob,
        ssn,
      });
      createResponse(res, 200, "Employee updated", { employee });
    } catch (err) {
      next(err);
    }
  }

  //update client
  static async updateClient(req, res, next) {
    try {
      const { id } = req.params;
      const { name, medicalId, signature, contactNumber, email } =
        req.body;

      const client = await Client.findByPk(id);
      if (!client) {
        const error = new Error("Client not found");
        error.status = 404;
        throw error;
      }

      await client.update({
        name,
        medicalId,
        signature,
        contactNumber,
        email,
      });

      createResponse(res, 200, "Client updated", { client });
    } catch (err) {
      next(err);
    }
  }

  //get organization by id
  static async getUserById(req, res, next) {
    try {
      const user = req.user;
      let data, notFoundMessage;
      switch (user.userType) {
        case "organization":
          data = await Organization.findByPk(user.id);
          notFoundMessage = "Organization not found";
          break;
        case "employee":
          data = await Employee.findByPk(user.id);
          notFoundMessage = "Employee not found";
          break;
        case "client":
          data = await Client.findByPk(user.id);
          notFoundMessage = "Client not found";
          break;
        default:
          const error = new Error("Invalid user type");
          error.status = 400;
          throw error;
      }

      if (!data) {
        const error = new Error(notFoundMessage);
        error.status = 404;
        throw error;
      }

      let safeData;
      if (data?.toJSON) {
        const { password, ...rest } = data.toJSON();
        safeData = rest;
      } else if (data && typeof data === "object" && "password" in data) {
        const { password, ...rest } = data;
        safeData = rest;
      } else {
        safeData = data;
      }
      createResponse(
        res,
        200,
        `${user.userType.charAt(0).toUpperCase() + user.userType.slice(1)} retrieved`,
        {
          data: safeData,
        }
      );
    } catch (err) {
      next(err);
    }
  }

  //get all clients without pagination
  static async getAllClients(req, res, next) {
    try {
      const clients = await Client.findAll({
        where: {
          orgId: req.user.orgId,
        },
      });
      createResponse(res, 200, "Clients retrieved", { clients });
    } catch (err) {
      next(err);
    }
  }

  //change password for organization, employee, or client
  static async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      const { user } = req;

      if (!currentPassword || !newPassword) {
        const error = new Error("Current and new passwords are required");
        error.status = 400;
        throw error;
      }

      let model;
      switch (user.userType) {
        case USER_TYPES.ORGANIZATION:
          model = Organization;
          break;
        case USER_TYPES.EMPLOYEE:
          model = Employee;
          break;
        case USER_TYPES.CLIENT:
          model = Client;
          break;
        default:
          const error = new Error("Invalid user type");
          error.status = 400;
          throw error;
      }

      const dbUser = await model.findByPk(user.id);
      if (!dbUser) {
        const error = new Error("User not found");
        error.status = 404;
        throw error;
      }
      const isMatch = await compare(currentPassword, dbUser.password);
      if (!isMatch) {
        const error = new Error("Current password is incorrect");
        error.status = 401;
        throw error;
      }

      const hashedNewPassword = await hash(newPassword, 10);
      await dbUser.update({ password: hashedNewPassword });

      createResponse(res, 200, "Password changed successfully");
    } catch (err) {
      next(err);
    }
  }

  //reset password for employee
  static async resetEmpPassword(req, res, next) {
    try {
      const { employeeId, newPassword } = req.body;
      const { user } = req;

      if (user.userType !== USER_TYPES.ORGANIZATION) {
        const error = new Error(
          "Only organization can reset employee passwords"
        );
        error.status = 403;
        throw error;
      }

      if (!employeeId || !newPassword) {
        const error = new Error("Email and new password are required");
        error.status = 400;
        throw error;
      }

      const employee = await Employee.findByPk(employeeId);
      if (!employee || employee.orgId !== req.user.id) {
        const error = new Error("Employee not found");
        error.status = 404;
        throw error;
      }
      const hashedNewPassword = await hash(newPassword, 10);
      await employee.update({ password: hashedNewPassword });

      createResponse(res, 200, "Password reset successfully");
    } catch (err) {
      next(err);
    }
  }

  //delete organization, employee, or client
  static async deleteUser(req, res, next) {
    try {
      const { id } = req.params;
      const { userType } = req.query;

      let model, notFoundMessage;
      switch (userType) {
        case USER_TYPES.ORGANIZATION:
          model = Organization;
          notFoundMessage = "Organization not found";
          break;
        case USER_TYPES.EMPLOYEE:
          model = Employee;
          notFoundMessage = "Employee not found";
          break;
        case USER_TYPES.CLIENT:
          model = Client;
          notFoundMessage = "Client not found";
          break;
        default:
          const error = new Error("Invalid user type");
          error.status = 400;
          throw error;
      }
      const dbUser = await model.findByPk(id);
      if (!dbUser) {
        const error = new Error(notFoundMessage);
        error.status = 404;
        throw error;
      }

      await dbUser.destroy();
      createResponse(res, 200, `${userType} deleted successfully`);
    } catch (err) {
      next(err);
    }
  }

  //user dashboard
  static async getDashboardData(req, res, next) {
    try {
      const user = req.user;

      const totalEmployees = await Employee.count({
        where: { orgId: user.orgId },
      });

      const totalClients = await Client.count({
        where: { orgId: user.orgId },
      });

      const employees = await Employee.findAll({
        where: { orgId: user.orgId },
        attributes: ['id'],
      });
      const employeeIds = employees.map(e => e.id);

      const totalTimesheets = await Timesheet.count({
        where: { employeeId: employeeIds },
      });

      const totalWork = await Work.count({
        where: { orgId: user.orgId },
      });

      const dashboardData = {
        totalEmployees,
        totalClients,
        totalTimesheets,
        totalWork,
      };
      return createResponse(res, 200, "Dashboard data retrieved", {
        dashboardData,
      });
    } catch (err) {
      next(err);
    }
  }

  //update employee profile

  static async updateEmployeeProfile(req, res, next) {
    try {
      const { id } = req.params;
      const {
        name,
        email,
        signature,
        role,
        reportingTo,
        contactNumber,
        address,
        gender,
        dob,
      } = req.body;
      const employee = await Employee.findByPk(id);
      if (!employee) {
        const error = new Error("Employee not found");
        error.status = 404;
        throw error;
      }
      await employee.update({
        name,
        email,
        signature,
        role,
        reportingTo,
        contactNumber,
        address,
        gender,
        dob,
      });
      createResponse(res, 200, "Employee updated", { employee });
    } catch (err) {
      next(err);
    }
  }



}

export default UserController;
