import { Router } from "express";
import UserController from "../controllers/user.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import uploadImage from "../middlewares/upload.middleware.js";
import {
  createClientSchema,
  createEmployeeSchema,
  createOrgSchema,
  validate,
} from "../middlewares/validation.middleware.js";
const router = Router();

const { superAdminAuth, orgAdminAuth, employeeAuth } = authMiddleware;

/**
 * @swagger
 * tags:
 *   - name: Users
 *     description: User management endpoints (requires authentication cookie)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     SuperAdmin:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: superadmin@healthcare.org
 *         password:
 *           type: string
 *           format: password
 *           minLength: 8
 *           example: superSecret123!
 *
 *     Organization:
 *       type: object
 *       required:
 *         - orgName
 *         - orgType
 *         - providerId
 *         - email
 *         - password
 *       properties:
 *         orgName:
 *           type: string
 *           example: "General Hospital"
 *         orgType:
 *           type: string
 *           example: "Hospital"
 *         logo:
 *           type: string
 *           format: base64
 *           example: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
 *         providerId:
 *           type: string
 *           example: "HOSP12345"
 *         description:
 *           type: string
 *           example: "A leading healthcare provider in the region"
 *         email:
 *           type: string
 *           format: email
 *           example: "admin@generalhospital.org"
 *         password:
 *           type: string
 *           format: password
 *           minLength: 8
 *           example: "hospital@123"
 *
 *     Employee:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *         - role
 *         - contactNumber
 *       properties:
 *         name:
 *           type: string
 *           example: "Dr. John Smith"
 *         email:
 *           type: string
 *           format: email
 *           example: "john.smith@hospital.org"
 *         password:
 *           type: string
 *           format: password
 *           minLength: 8
 *           example: "doctor@123"
 *         signature:
 *           type: string
 *           format: base64
 *           example: "data:image/png;base64,..."
 *         role:
 *           type: string
 *           enum: ["doctor", "nurse", "admin", "staff"]
 *           example: "doctor"
 *         reportingTo:
 *           type: integer
 *           example: 2
 *         contactNumber:
 *           type: string
 *           example: "+15551234567"
 *         address:
 *           type: string
 *           example: "123 Medical Dr, Boston, MA"
 *         gender:
 *           type: string
 *           enum: ["male", "female", "other"]
 *         dob:
 *           type: string
 *           format: date
 *           example: "1980-05-15"
 *
 *     ApiResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: integer
 *           enum: [200, 201, 400, 401, 403, 404, 500]
 *         message:
 *           type: string
 *         data:
 *           type: object
 */

/**
 * @swagger
 * /api/users/super-admin:
 *   post:
 *     summary: Create initial super admin (Development only)
 *     description: This endpoint is only available in development environment to create the first super admin.
 *     tags: [Users]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SuperAdmin'
 *     responses:
 *       201:
 *         description: Super admin created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Invalid input or super admin already exists
 *       403:
 *         description: Forbidden (not in development environment)
 */

/**
 * @swagger
 * /api/users/organizations:
 *   post:
 *     summary: Create a new organization (Super Admin only)
 *     description: Creates a new healthcare organization. Requires super admin authentication cookie.
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Organization'
 *     responses:
 *       201:
 *         description: Organization created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized - No valid authentication cookie
 *       403:
 *         description: Forbidden (not super admin)
 */

/**
 * @swagger
 * /api/users/employees:
 *   post:
 *     summary: Create a new employee (Organization Admin only)
 *     description: Creates a new employee within the authenticated organization. Requires organization admin authentication cookie.
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Employee'
 *     responses:
 *       201:
 *         description: Employee created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized - No valid authentication cookie
 *       403:
 *         description: Forbidden (not organization admin)
 */

/**
 * @swagger
 * /api/users/clients:
 *   post:
 *     summary: Create a new client (Organization Admin only)
 *     description: Creates a new client within the authenticated organization. Requires organization admin authentication cookie.
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Client'
 *     responses:
 *       201:
 *         description: Client created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized - No valid authentication cookie
 *       403:
 *         description: Forbidden (not organization admin)
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users by type
 *     description: Retrieves paginated list of users filtered by type with optional search functionality. Requires authentication cookie.
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: userType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [organization, employee, client]
 *         description: Type of user to filter by
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of users per page
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *         description: Pagination cursor
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search query to filter results (searches across name, email, and other relevant fields)
 *         example: "john"
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Users retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     oneOf:
 *                       - $ref: '#/components/schemas/Organization'
 *                       - $ref: '#/components/schemas/Employee'
 *                       - $ref: '#/components/schemas/Client'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: Unauthorized - No valid authentication cookie
 *       403:
 *         description: Forbidden (insufficient permissions)
 */

// Super admin routes
router.post("/super-admin", UserController.createSuperAdmin);
router.post(
  "/organizations",
  superAdminAuth,
  uploadImage,
  validate(createOrgSchema),
  UserController.createOrganization
);

// Organization admin routes
router.post(
  "/employees",
  orgAdminAuth,
  validate(createEmployeeSchema),
  UserController.createEmployee
);
router.post(
  "/clients",
  orgAdminAuth,
  validate(createClientSchema),
  UserController.createClient
);
router.get("/", orgAdminAuth, UserController.getAllUsers);
router.post(
  "/organization/:id",
  orgAdminAuth,
  UserController.updateOrganization
);
router.post("/employee/:id", orgAdminAuth, UserController.updateEmployee);
router.post('employee/profile/:id', employeeAuth, UserController.updateEmployeeProfile);
router.post("/client/:id", orgAdminAuth, UserController.updateClient);
router.get("/profile", employeeAuth, UserController.getUserById);
router.post('/changepassword', employeeAuth, UserController.changePassword);
router.post('/resetEmpPassword', orgAdminAuth, UserController.resetEmpPassword);
router.delete("/:id", orgAdminAuth, UserController.deleteUser);
router.get('/dashboard', orgAdminAuth, UserController.getDashboardData);

export default router;
