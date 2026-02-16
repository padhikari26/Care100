import { Router } from "express";
import WorkController from "../controllers/work.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import {
  assignWorkSchema,
  createWorkSchema,
  validate,
} from "../middlewares/validation.middleware.js";
const router = Router();
const { orgAdminAuth } = authMiddleware;

/**
 * @swagger
 * tags:
 *   name: Works
 *   description: Work management and assignment endpoints (requires authentication cookie)
 */

/**
 * @swagger
 * /api/works:
 *   post:
 *     summary: Create a new work
 *     description: Creates a new work type (e.g., Hygiene, Meal Preparation). Requires organization admin authentication cookie.
 *     tags: [Works]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - name
 *             properties:
 *               code:
 *                 type: integer
 *                 description: Unique identifier for the work
 *                 example: 122
 *               name:
 *                 type: string
 *                 description: Name of the work
 *                 example: Hygiene
 *               description:
 *                 type: string
 *                 description: Optional description of the work
 *                 example: Assist with personal hygiene tasks
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Work created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 201
 *                 message:
 *                   type: string
 *                   example: Work created
 *                 data:
 *                   $ref: '#/components/schemas/Work'
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Unauthorized - No valid authentication cookie
 *       403:
 *         description: Forbidden (not organization admin)
 */
router.post(
  "/",
  orgAdminAuth,
  validate(createWorkSchema),
  WorkController.createWork
);

/**
 * @swagger
 * /api/works/{id}:
 *   put:
 *     summary: Update a work
 *     description: Updates an existing work. Requires organization admin authentication cookie.
 *     tags: [Works]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the work to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - name
 *             properties:
 *               code:
 *                 type: integer
 *                 example: 122
 *               name:
 *                 type: string
 *                 example: Hygiene
 *               description:
 *                 type: string
 *                 example: Assist with personal hygiene tasks
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Work updated successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Unauthorized - No valid authentication cookie
 *       403:
 *         description: Forbidden (not organization admin)
 *       404:
 *         description: Work not found
 */
router.put(
  "/:id",
  orgAdminAuth,
  validate(createWorkSchema),
  WorkController.updateWork
);

/**
 * @swagger
 * /api/works/{id}:
 *   delete:
 *     summary: Delete a work
 *     description: Deletes a work. Requires organization admin authentication cookie.
 *     tags: [Works]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the work to delete
 *     responses:
 *       200:
 *         description: Work deleted successfully
 *       401:
 *         description: Unauthorized - No valid authentication cookie
 *       403:
 *         description: Forbidden (not organization admin)
 *       404:
 *         description: Work not found
 */
router.delete("/:id", orgAdminAuth, WorkController.deleteWork);

/**
 * @swagger
 * /api/works:
 *   get:
 *     summary: Get all works
 *     description: Retrieves a paginated list of all works for the organization with optional search functionality. Requires authentication cookie.
 *     tags: [Works]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of works to return per page
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *           nullable: true
 *         description: Cursor for pagination
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search query to filter works by name or description
 *         example: "hygiene"
 *     responses:
 *       200:
 *         description: Works retrieved successfully
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
 *                   example: Works retrieved
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Work'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: Unauthorized - No valid authentication cookie
 *       403:
 *         description: Forbidden (insufficient permissions)
 */
router.get("/", orgAdminAuth, WorkController.getAllWorks);

/**
 * @swagger
 * /api/works/assign:
 *   post:
 *     summary: Assign work to an employee
 *     description: Assigns a specific work to an employee for a client. Requires organization admin authentication cookie.
 *     tags: [Works]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - employeeId
 *               - clientId
 *               - workId
 *             properties:
 *               employeeId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the employee
 *                 example: 123e4567-e89b-12d3-a456-426614174000
 *               clientId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the client
 *                 example: 987fcdeb-1234-5678-9012-345678901234
 *               workId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the work
 *                 example: 456789ab-cdef-1234-5678-901234567890
 *     responses:
 *       201:
 *         description: Work assigned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 201
 *                 message:
 *                   type: string
 *                   example: Work assigned
 *                 data:
 *                   $ref: '#/components/schemas/WorkAssignment'
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Unauthorized - No valid authentication cookie
 *       403:
 *         description: Forbidden (not organization admin or mismatched organization)
 *       404:
 *         description: Employee, client, or work not found
 */
router.post(
  "/assign",
  orgAdminAuth,
  validate(assignWorkSchema),
  WorkController.assignWork
);

export default router;
