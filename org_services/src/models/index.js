// models/index.js
import { Sequelize } from 'sequelize';
import config from '../config/database.js';
import createSuperAdminModel from './SuperAdmin.js';
import createOrganizationModel from './Organization.js';
import createEmployeeModel from './Employee.js';
import createClientModel from './Client.js';
import createWorkModel from './Work.js';
import createWorkAssignmentModel from './WorkAssignment.js';
import createTimesheetModel from './Timesheet.js';

const sequelize = new Sequelize(config);

const models = {
    SuperAdmin: createSuperAdminModel(sequelize),
    Organization: createOrganizationModel(sequelize),
    Employee: createEmployeeModel(sequelize),
    Client: createClientModel(sequelize),
    Work: createWorkModel(sequelize),
    WorkAssignment: createWorkAssignmentModel(sequelize),
    Timesheet: createTimesheetModel(sequelize),
};

Object.values(models).forEach((model) => {
    if (model.associate) {
        model.associate(models);
    }
});

export default models;
export const SuperAdmin = models.SuperAdmin;
export const Organization = models.Organization;
export const Employee = models.Employee;
export const Client = models.Client;
export const Work = models.Work;
export const WorkAssignment = models.WorkAssignment;
export const Timesheet = models.Timesheet;
export { sequelize };