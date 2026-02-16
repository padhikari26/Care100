import { Client, Employee, Work, WorkAssignment } from "../models/index.js";
import createResponse from "../utils/apiResponse.js";
import { USER_TYPES } from "../utils/constants.js";
import { paginate } from "../utils/paginate.js";

class WorkController {
  static async createWork(req, res, next) {
    try {
      const { code, name, description } = req.body;
      const work = await Work.create({ code, name, description, orgId: req.user.orgId });
      createResponse(res, 201, "Work created", { work });
    } catch (err) {
      next(err);
    }
  }

  static async updateWork(req, res, next) {
    try {
      const { id } = req.params;
      const { workId, name, description } = req.body;
      const work = await Work.findByPk(id);
      if (!work) {
        const error = new Error("Work not found");
        error.status = 404;
        throw error;
      }
      await work.update({ workId, name, description });
      createResponse(res, 200, "Work updated", { work });
    } catch (err) {
      next(err);
    }
  }

  static async deleteWork(req, res, next) {
    try {
      const { id } = req.params;
      const work = await Work.findByPk(id);
      if (!work) {
        const error = new Error("Work not found");
        error.status = 404;
        throw error;
      }
      await work.destroy();
      createResponse(res, 200, "Work deleted");
    } catch (err) {
      next(err);
    }
  }

  static async getAllWorks(req, res, next) {
    try {
      const { limit = 10, page = 1, search } = req.query;

      // Define search fields for works
      const searchFields = ["name", "description"];

      // Add organization filter if user is organization admin
      const whereCondition = {};
      if (req.user.userType === USER_TYPES.ORGANIZATION) {
        whereCondition.orgId = req.user.orgId;
      }

      const { items: data, pagination } = await paginate(Work, {
        limit,
        page,
        search,
        searchFields,
        where: whereCondition,
      });

      console.log(data);

      createResponse(res, 200, "Works retrieved", { data, pagination });
    } catch (err) {
      next(err);
    }
  }

  static async assignWork(req, res, next) {
    try {
      const { employeeId, clientId, workId } = req.body;

      // Verify employee and client exist and belong to the same organization
      const employee = await Employee.findByPk(employeeId);
      const client = await Client.findByPk(clientId);
      const work = await Work.findByPk(workId);

      if (!employee || !client || !work) {
        const error = new Error("Employee, client, or work not found");
        error.status = 404;
        throw error;
      }

      if (
        employee.orgId !== client.orgId ||
        employee.orgId !== req.user.orgId
      ) {
        const error = new Error("Unauthorized: Mismatched organization");
        error.status = 403;
        throw error;
      }

      const assignment = await WorkAssignment.create({
        employeeId,
        clientId,
        workId,
      });
      createResponse(res, 201, "Work assigned", { assignment });
    } catch (err) {
      next(err);
    }
  }
}

export default WorkController;
