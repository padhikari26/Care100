import { Router } from "express";
import AuthController from "../controllers/auth.controller.js";
import auth from "../middlewares/auth.middleware.js";
import { loginSchema, validate, registerSchema } from "../middlewares/validation.middleware.js";
const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@healthcare.org
 *               password:
 *                 type: string
 *                 format: password
 *                 example: emppassword123
 *     responses:
 *       200:
 *         description: Login successful - Sets HTTP-only cookie
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: authToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; HttpOnly; Secure; SameSite=None
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
 *                   example: Login successful
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Invalid credentials
 */

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: User logout
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logout successful - Clears HTTP-only cookie
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
 *                   example: Logout successful
 */

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user info
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Current user data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 */

router.post("/login", validate(loginSchema), AuthController.login);
router.get('/authAddSectionList', AuthController.authAddSectionList);
router.post("/register", validate(registerSchema), AuthController.preRegisterEmployee)
router.post("/employee-login", AuthController.employeeLogin);
router.post("/logout", AuthController.logout);
router.get("/me", auth.employeeAuth, AuthController.getCurrentUser);

export default router;
