import { string, date } from 'joi';
import { USER_TYPES, ROLES } from './constants';

const customValidators = {
    password: string()
        .min(8)
        .max(30)
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])'))
        .message(
            'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'
        ),

    email: string().email().lowercase().trim(),

    phone: string()
        .pattern(/^\+?[1-9]\d{1,14}$/)
        .message('Phone number must be in E.164 format'),

    userType: string().valid(...Object.values(USER_TYPES)),

    role: string().valid(...Object.values(ROLES)),

    dateOfBirth: date().max('now').iso(),

    medicalId: string()
        .pattern(/^[A-Z]{3}\d{6,10}$/)
        .message('Medical ID must start with 3 letters followed by 6-10 digits')
};

const validate = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body, {
        abortEarly: false,
        allowUnknown: false
    });

    if (error) {
        const errors = error.details.map((detail) => ({
            field: detail.path.join('.'),
            message: detail.message.replace(/['"]/g, '')
        }));
        return next(new ApiError(400, 'Validation failed', { errors }));
    }
    next();
};

export default {
    ...customValidators,
    validate,
    objectId: string().hex().length(24) // For MongoDB IDs
};