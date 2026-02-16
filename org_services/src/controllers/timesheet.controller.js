import { Op, or } from "sequelize";
import {
    Client,
    Employee,
    Organization,
    Timesheet,
    Work,
} from "../models/index.js";
import createResponse from "../utils/apiResponse.js";
import { USER_TYPES } from "../utils/constants.js";
import { paginate } from "../utils/paginate.js";
import { generateTimesheetPDF } from "../utils/pdfGenerator.js";


class TimesheetController {

    static async submitTimesheet(req, res, next) {
        try {
            const {
                clientId,
                date,
                clockIn,
                clockOut,
                clientSignature,
                completedWorks,
                reason,
                gps,
            } = req.body;
            const employeeId = req.user.id;

            const client = await Client.findByPk(clientId);
            if (!client || client.orgId !== req.user.orgId) {
                const error = new Error("Client not found or unauthorized");
                error.status = 404;
                throw error;
            }
            const employee = await Employee.findByPk(employeeId);
            if (!employee || employee.orgId !== req.user.orgId) {
                const error = new Error("Employee not found or unauthorized");
                error.status = 404;
                throw error;
            }

            const works = await Work.findAll({
                where: { orgId: req.user.orgId },
                attributes: ["id"],
            });
            const assignedWorkIds = works.map((work) => work.id.toString());

            const submittedWorkIds = completedWorks.map((work) => work.workId);
            const invalidWorks = submittedWorkIds.filter(
                (workId) => !assignedWorkIds.includes(workId)
            );
            if (invalidWorks.length > 0) {
                const error = new Error(`Invalid work IDs: ${invalidWorks.join(", ")}`);
                error.status = 400;
                throw error;
            }
            const dateOnlyUtc = new Date(new Date(date).toISOString().split('T')[0] + 'T00:00:00.000Z');
            const clockInDate = new Date(clockIn);
            const clockOutDate = clockOut ? new Date(clockOut) : null;

            const existingTimesheet = await Timesheet.findOne({
                where: { employeeId, clientId, date: dateOnlyUtc },
            });

            if (existingTimesheet) {
                throw new Error("Timesheet already submitted for this date");
            }

            const timesheet = await Timesheet.create({
                employeeId,
                clientId,
                date: dateOnlyUtc,
                clockIn: clockInDate,
                clockOut: clockOutDate,
                clientSignature,
                completedWorks,
                reason,
                gps,
            });

            createResponse(res, 201, "Timesheet submitted", { timesheet });
        } catch (err) {
            next(err);
        }
    }

    //update timesheet
    static async updateTimesheet(req, res, next) {
        try {
            const { id } = req.params;
            const {
                clientId,
                date,
                clockIn,
                clockOut,
                clientSignature,
                completedWorks,
                reason,
                gps,
            } = req.body;
            const employeeId = req.user.id;
            const timesheet = await Timesheet.findByPk(id);
            if (!timesheet) {
                const error = new Error("Timesheet not found");
                error.status = 404;
                throw error;
            }
            if (
                req.user.userType === USER_TYPES.ORGANIZATION &&
                timesheet.Employee.orgId !== req.user.orgId
            ) {
                const error = new Error(
                    "Unauthorized: Timesheet not in your organization"
                );
                error.status = 403;
                throw error;
            }
            const client = await Client.findByPk(clientId);
            if (!client || client.orgId !== req.user.orgId) {
                const error = new Error("Client not found or unauthorized");
                error.status = 404;
                throw error;
            }
            const employee = await Employee.findByPk(employeeId);
            if (!employee || employee.orgId !== req.user.orgId) {
                const error = new Error("Employee not found or unauthorized");
                error.status = 404;
                throw error;
            }
            const works = await Work.findAll({
                where: { orgId: req.user.orgId },
                attributes: ["id"],
            });
            const assignedWorkIds = works.map((work) => work.id.toString());

            const submittedWorkIds = completedWorks.map((work) => work.workId);
            const invalidWorks = submittedWorkIds.filter(
                (workId) => !assignedWorkIds.includes(workId)
            );
            if (invalidWorks.length > 0) {
                const error = new Error(`Invalid work IDs: ${invalidWorks.join(", ")}`);
                error.status = 400;
                throw error;
            }
            const dateOnlyUtc = new Date(new Date(date).toISOString().split('T')[0] + 'T00:00:00.000Z');
            const clockInDate = new Date(clockIn);
            const clockOutDate = clockOut ? new Date(clockOut) : null;
            await timesheet.update({
                employeeId,
                clientId,
                date: dateOnlyUtc,
                clockIn: clockInDate,
                clockOut: clockOutDate,
                clientSignature,
                completedWorks,
                reason,
                gps,
            });
            createResponse(res, 200, "Timesheet updated", { timesheet });
        } catch (err) {
            next(err);
        }
    }

    // Admin/Employee: Get timesheets
    static async getTimesheets(req, res, next) {
        try {
            const {
                limit = 10,
                page = 1,
                clientId,
                employeeId,
                date,
                endDate,
                search,
            } = req.query;
            const where = {};
            let empId;

            if (req.user.userType === USER_TYPES.EMPLOYEE) {
                where.employeeId = req.user.id;
                empId = req.user.id;
            } else if (employeeId) {
                where.employeeId = employeeId;
            }

            if (empId || employeeId) {
                const employee = await Employee.findByPk(empId || employeeId);
                if (!employee) {
                    const error = new Error("Employee not found or unauthorized");
                    error.status = 404;
                    throw error;
                }
            }

            if (clientId) {
                where.clientId = clientId;
            }

            if (date && endDate) {
                const from = new Date(date);
                from.setHours(0, 0, 0, 0);
                const to = new Date(endDate);
                to.setHours(23, 59, 59, 999);
                where.date = {
                    [Op.between]: [from, to],
                };
            } else if (date) {
                where.date = Date(date);
            }

            if (req.user.userType === USER_TYPES.ORGANIZATION) {
                where["$Employee.orgId$"] = req.user.orgId;
            }

            const searchFields = ["$Employee.name$", "$Client.name$"];

            const { items: data, pagination } = await paginate(Timesheet, {
                limit,
                page,
                where,
                search,
                searchFields,
                include: [
                    { model: Employee, attributes: ["name", "orgId"] },
                    { model: Client, attributes: ["name"] },
                ],
            });

            createResponse(res, 200, "Timesheets retrieved", {
                data: data,
                pagination,
            });
        } catch (err) {
            next(err);
        }
    }

    static async getTimesheetWeekly(req, res, next) {
        try {
            const { startDate, endDate } = req.query;
            const from = new Date(startDate);
            from.setHours(0, 0, 0, 0);
            const to = new Date(endDate);
            to.setHours(23, 59, 59, 999);
            const employeeId = req.user.id;
            const workingUser = await Employee.findByPk(employeeId);
            if (!workingUser || workingUser.orgId !== req.user.orgId) {
                const error = new Error("Employee not found or unauthorized");
                error.status = 404;
                throw error;
            }
            const timesheets = await Timesheet.findAll({
                where: {
                    employeeId,
                    date: {
                        [Op.between]: [from, to],
                    },
                },
                include: [
                    { model: Employee, attributes: ["name"] },
                    { model: Client, attributes: ["name"] },
                ],
            });
            createResponse(res, 200, "Timesheets retrieved", { timesheets });
        } catch (err) {
            next(err);
        }
    }

    static async getTimesheetById(req, res, next) {
        try {
            const { id } = req.params;
            const timesheet = await Timesheet.findByPk(id, {
                include: [
                    { model: Employee, attributes: ["name", "orgId"] },
                    { model: Client, attributes: ["name"] },
                ],
            });
            if (!timesheet) {
                const error = new Error("Timesheet not found");
                error.status = 404;
                throw error;
            }
            if (
                req.user.userType === USER_TYPES.ORGANIZATION &&
                timesheet.Employee.orgId !== req.user.orgId
            ) {
                const error = new Error(
                    "Unauthorized: Timesheet not in your organization"
                );
                error.status = 403;
                throw error;
            }
            createResponse(res, 200, "Timesheet retrieved", { timesheet });
        } catch (err) {
            next(err);
        }
    }

    // static async updateTimesheet(req, res, next) {
    //     try {
    //         const { id } = req.params;
    //         const { clientId, date, clockIn, clockOut, clientSignature, completedWorks, reason, gps } = req.body;

    //         const timesheet = await Timesheet.findByPk(id);
    //         if (!timesheet) {
    //             const error = new Error('Timesheet not found');
    //             error.status = 404;
    //             throw error;
    //         }
    //         if (req.user.userType === USER_TYPES.ORGANIZATION && timesheet.Employee.orgId !== req.user.orgId) {
    //             const error = new Error('Unauthorized: Timesheet not in your organization');
    //             error.status = 403;
    //         throw error;
    //         }

    //         await timesheet.update({ clientId, date, clockIn, clockOut, clientSignature, completedWorks: JSON.stringify(completedWorks), reason, gps });
    //         createResponse(res, 200, 'Timesheet updated', { timesheet });
    //     } catch (err) {
    //         next(err);
    //     }
    // }

    static async downloadTimesheet(req, res, next) {
        try {
            const { startDate, employeeId } = req.body;
            const workingUser = await Employee.findOne({
                where: {
                    id: employeeId,
                    orgId: req.user.orgId || req.user.id, // Use orgId if available, otherwise use user id
                },
            });
            if (!workingUser) {
                const error = new Error("Employee not found or unauthorized");
                error.status = 404;
                throw error;
            }
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            const end = new Date(start);
            end.setDate(start.getDate() + 6);
            end.setHours(23, 59, 59, 999);
            const timesheets = await Timesheet.findAll({
                where: {
                    employeeId: workingUser.id,
                    date: {
                        [Op.between]: [start, end],
                    },
                },
                include: [
                    { model: Employee, attributes: ["name"] },
                    { model: Client, attributes: ["name"] },
                ],
            });
            if (!timesheets || timesheets.length === 0) {
                createResponse(
                    res,
                    404,
                    "No timesheets found for the specified date range"
                );
                return;
            }
            const totalHoursWorked = timesheets.reduce((total, timesheet) => {
                const clockIn = new Date(timesheet.clockIn);
                const clockOut = new Date(timesheet.clockOut);
                const hoursWorked = (clockOut - clockIn) / (1000 * 60 * 60);
                return total + hoursWorked;
            }, 0);

            const allWorks = await Work.findAll({
                where: {
                    orgId: req.user.orgId,
                },
            });
            const clientSignature = timesheets[0].clientSignature;
            const client = await Client.findByPk(timesheets[0].clientId, {
                attributes: ["name", "medicalId"],
            });
            //direct care worker == employee name
            const directCareWorker = await Employee.findByPk(
                timesheets[0].employeeId,
                {
                    attributes: ["name", "ssn", "signature", "orgId"],
                }
            );
            if (!directCareWorker) {
                const error = new Error("Employee (Direct Care Worker) not found");
                error.status = 404;
                throw error;
            }
            const organization = await Organization.findByPk(directCareWorker.orgId, {
                attributes: ["providerId", 'logo'],
            });
            const result = timesheets.map((timesheet) => ({
                date: timesheet.date.toString(),
                clockIn: timesheet.clockIn,
                clockOut: timesheet.clockOut,
                completedWorks: timesheet.completedWorks,
                reason: timesheet.reason,
                gps: timesheet.gps,
            }));
            const pdfBuffer = await generateTimesheetPDF(
                client,
                result,
                startDate,
                end,
                totalHoursWorked,
                clientSignature,
                allWorks,
                directCareWorker,
                organization.providerId,
                directCareWorker.signature,
                organization.logo
            );

            res.setHeader("Content-Type", "application/pdf");
            res.setHeader(
                "Content-Disposition",
                `attachment; filename=timesheet-${start}.pdf`
            );
            res.setHeader("Content-Length", pdfBuffer.length);
            res.send(pdfBuffer);
        } catch (err) {
            next(err);
        }
    }

    //get add section list for timesheet client with id and name, works with id and name and workId,

    static async getAddSectionList(req, res, next) {
        try {
            const employeeId = req.user.id;
            const workingUser = await Employee.findByPk(employeeId);
            if (!workingUser || workingUser.orgId !== req.user.orgId) {
                const error = new Error("Employee not found or unauthorized");
                error.status = 404;
                throw error;
            }
            const works = await Work.findAll({
                where: { orgId: req.user.orgId },
                attributes: ["id", "name", "code", "description"],
            });
            const clients = await Client.findAll({
                where: { orgId: req.user.orgId },
                attributes: ["id", "name"],
            });
            createResponse(res, 200, "Add Section Fetched", { works, clients });
        } catch (err) {
            next(err);
        }
    }

    //get add section list with employee id and name,
    static async getAddSectionListWithEmployee(req, res, next) {
        try {
            if (req.user.userType !== USER_TYPES.ORGANIZATION) {
                const error = new Error(
                    "Unauthorized: Only organization can access this endpoint"
                );
                error.status = 403;
                throw error;
            }

            const { limit = 10, page = 1, search } = req.query;
            const where = { orgId: req.user.id };

            // Define search fields for employee name
            const searchFields = ["name"];

            const { items: employees, pagination } = await paginate(Employee, {
                limit,
                page,
                where,
                search,
                searchFields,
                attributes: ["id", "name"],
            });

            createResponse(res, 200, "Add Section Fetched", {
                employees,
                pagination,
            });
        } catch (err) {
            next(err);
        }
    }
}

export default TimesheetController;