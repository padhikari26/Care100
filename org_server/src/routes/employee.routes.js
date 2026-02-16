import { Router } from "express";
import EmployeeController from "../controllers/employee.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
const router = Router();
const { employeeAuth } = authMiddleware;

/**
 * @swagger
 * tags:
 *   name: Employee
 *   description: Employee-specific endpoints (requires authentication cookie)
 */

/**
 * @swagger
 * /api/employee/assignedWork:
 *   get:
 *     summary: Get assigned works for an employee
 *     description: Retrieves all works assigned to a specific employee, including work and client details. Requires authentication cookie.
 *     tags: [Employee]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: employeeId
 *         required: false
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Employee ID (only required for org admin or super admin, employees automatically get their own assignments)
 *     responses:
 *       200:
 *         description: Assigned works retrieved successfully
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
 *                   example: Assigned works retrieved
 *                 works:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/WorkAssignment'
 *       401:
 *         description: Unauthorized - No valid authentication cookie
 *       403:
 *         description: Forbidden (insufficient permissions or employee not in organization)
 *       404:
 *         description: Employee not found
 */
router.get(
  "/assignedWork",
  employeeAuth,
  EmployeeController.getEmployeeAssignedWorks
);

/**
 * @swagger
 * /api/employee/clients:
 *   get:
 *     summary: Get clients assigned to an employee
 *     description: Retrieves all clients associated with an employee through work assignments. Requires authentication cookie.
 *     tags: [Employee]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: employeeId
 *         required: false
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Employee ID (only required for org admin or super admin, employees automatically get their own clients)
 *     responses:
 *       200:
 *         description: Clients retrieved successfully
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
 *                   example: Clients retrieved
 *                 clients:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Client'
 *       401:
 *         description: Unauthorized - No valid authentication cookie
 *       403:
 *         description: Forbidden (insufficient permissions or employee not in organization)
 *       404:
 *         description: Employee not found
 */
router.get("/clients", employeeAuth, EmployeeController.getEmployeeClients);

export default router;
