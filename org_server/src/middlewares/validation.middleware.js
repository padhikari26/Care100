import Joi from 'joi';
import { USER_TYPES } from '../utils/constants.js';
import createResponse from '../utils/apiResponse.js';

const validate = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body, {
        abortEarly: false,
        allowUnknown: false
    });
    if (error) {
        const errors = error.details.map((detail) => ({
            field: detail.path.join('.'),
            message: detail.message.replace(/['"]+/g, '')
        }));
        console.log(errors);
        throw new createResponse(res, 400, 'Validation failed', { errors });
    }
    next();
};

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
});

const registerSchema = Joi.object({
    orgId: Joi.string().required(),
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    role: Joi.string().required(),
    contactNumber: Joi.string().required(),
    address: Joi.string().allow(''),
    gender: Joi.string().allow(''),
    dob: Joi.date().allow(null),
    ssn: Joi.string().allow(null),
});

const createOrgSchema = Joi.object({
    orgName: Joi.string().required(),
    orgType: Joi.string().required(),
    logo: Joi.string().allow(''),
    providerId: Joi.string().required(),
    description: Joi.string().allow(''),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    expiryDate: Joi.date().iso().required(),
});

const createEmployeeSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    signature: Joi.string().allow(''),
    role: Joi.string().required(),
    contactNumber: Joi.string().required(),
    address: Joi.string().allow(''),
    gender: Joi.string().allow(''),
    dob: Joi.date().allow(null),
    ssn: Joi.string().allow(null),
    verified: Joi.boolean(),
    code: Joi.string().required(),
});

const createClientSchema = Joi.object({
    name: Joi.string().required(),
    medicalId: Joi.string().required(),
    signature: Joi.string().allow(''),
    contactNumber: Joi.string().required(),
    email: Joi.string().email().allow(''),
});

const createWorkSchema = Joi.object({
    code: Joi.number().integer().required(),
    name: Joi.string().required(),
    description: Joi.string().allow(''),
});

const assignWorkSchema = Joi.object({
    employeeId: Joi.string().uuid().required(),
    clientId: Joi.string().uuid().required(),
    workId: Joi.string().uuid().required(),
});

const submitTimesheetSchema = Joi.object({
    clientId: Joi.string().uuid().required(),
    date: Joi.date().iso().required(),
    clockIn: Joi.date().iso().required(),
    clockOut: Joi.date().iso().allow(null),
    clientSignature: Joi.string().allow(''),
    completedWorks: Joi.array().items(
        Joi.object({
            workId: Joi.string().uuid().required(),
            code: Joi.number().integer().required(),
            completed: Joi.boolean().required(),
        })
    ).required(),
    reason: Joi.string().allow(''),
    gps: Joi.string().allow(''),
});

export {
    validate,
    loginSchema,
    registerSchema,
    createOrgSchema,
    createEmployeeSchema,
    createClientSchema,
    createWorkSchema,
    assignWorkSchema,
    submitTimesheetSchema,
};