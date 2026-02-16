import { Router } from "express";
import TimesheetController from "../controllers/timesheet.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import {
  submitTimesheetSchema,
  validate,
} from "../middlewares/validation.middleware.js";
const router = Router();
const { employeeAuth } = authMiddleware;

/**
 * @swagger
 * tags:
 *   name: Timesheets
 *   description: Timesheet management endpoints (requires authentication cookie)
 */

/**
 * @swagger
 * /api/timesheet:
 *   post:
 *     summary: Submit a timesheet
 *     description: Allows an employee to submit a daily timesheet with completed works, clock-in/out times, client signature, and reasons for incomplete works. Requires employee authentication cookie.
 *     tags: [Timesheets]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - clientId
 *               - date
 *               - clockIn
 *               - completedWorks
 *             properties:
 *               clientId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the client
 *                 example: 456789ab-cdef-1234-5678-901234567891
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Date of the timesheet
 *                 example: 2025-05-07
 *               clockIn:
 *                 type: string
 *                 format: date-time
 *                 description: Clock-in time
 *                 example: 2025-05-07T08:00:00Z
 *               clockOut:
 *                 type: string
 *                 format: date-time
 *                 description: Clock-out time
 *                 example: 2025-05-07T16:00:00Z
 *                 nullable: true
 *               clientSignature:
 *                 type: string
 *                 description: Client's signature (base64-encoded image)
 *                 example: data:image/png;base64,iVBORw0KGgo...
 *                 nullable: true
 *               completedWorks:
 *                 type: array
 *                 description: List of works with completion status
 *                 items:
 *                   type: object
 *                   required:
 *                     - workId
 *                   properties:
 *                     workId:
 *                       type: string
 *                       format: uuid
 *                       description: ID of the work
 *                       example: 789abcde-f123-4567-8901-234567890123
 *               reason:
 *                 type: string
 *                 description: Reason for incomplete works
 *                 example: Client was unavailable for Meal Preparation
 *                 nullable: true
 *               gps:
 *                 type: string
 *                 description: GPS coordinates
 *                 example: 40.7128,-74.0060
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Timesheet submitted successfully
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
 *                   example: Timesheet submitted
 *                 data:
 *                   $ref: '#/components/schemas/Timesheet'
 *       400:
 *         description: Validation failed or timesheet already submitted
 *       401:
 *         description: Unauthorized - No valid authentication cookie
 *       403:
 *         description: Forbidden (not employee)
 *       404:
 *         description: Client not found
 */
router.post(
  "/",
  employeeAuth,
  validate(submitTimesheetSchema),
  TimesheetController.submitTimesheet
);
router.put(
  "/:id",
  employeeAuth,
  validate(submitTimesheetSchema),
  TimesheetController.updateTimesheet
);

/**
 * @swagger
 * /api/timesheet:
 *   get:
 *     summary: Get timesheets
 *     description: Retrieves a paginated list of timesheets for the authenticated user with optional search functionality. Requires authentication cookie.
 *     tags: [Timesheets]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of timesheets to return per page
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *           nullable: true
 *         description: Cursor for pagination
 *       - in: query
 *         name: employeeId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by employee ID (for org admin or super admin)
 *       - in: query
 *         name: clientId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by client ID
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by specific date
 *         example: 2025-05-07
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by date range (use with date parameter)
 *         example: 2025-05-13
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search query to filter timesheets by employee name or client name
 *         example: "john"
 *     responses:
 *       200:
 *         description: Timesheets retrieved successfully
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
 *                   example: Timesheets retrieved
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Timesheet'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: Unauthorized - No valid authentication cookie
 *       403:
 *         description: Forbidden (insufficient permissions)
 */
router.get("/", employeeAuth, TimesheetController.getTimesheets);
router.get("/weekly", employeeAuth, TimesheetController.getTimesheetWeekly);

/**
 * @swagger
 * /api/timesheet/{id}:
 *   get:
 *     summary: Get timesheet by ID
 *     description: Retrieves a specific timesheet by its ID. Requires authentication cookie.
 *     tags: [Timesheets]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Timesheet ID
 *     responses:
 *       200:
 *         description: Timesheet retrieved successfully
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
 *                   example: Timesheet retrieved
 *                 data:
 *                   $ref: '#/components/schemas/Timesheet'
 *       401:
 *         description: Unauthorized - No valid authentication cookie
 *       403:
 *         description: Forbidden (timesheet not accessible)
 *       404:
 *         description: Timesheet not found
 */

router.get(
  "/addSectionList",
  employeeAuth,
  TimesheetController.getAddSectionList
);
router.get(
  "/addSectionListWithEmployee",
  employeeAuth,
  TimesheetController.getAddSectionListWithEmployee
);
router.get("/:id", employeeAuth, TimesheetController.getTimesheetById);

/**
 * @swagger
 * /api/timesheet/download/weekly:
 *   get:
 *     summary: Download weekly timesheet PDF
 *     description: Downloads a weekly timesheet as PDF for the authenticated employee. Requires authentication cookie.
 *     tags: [Timesheets]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Start date for the timesheet
 *         example: 2025-05-01
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: End date for the timesheet
 *         example: 2025-05-07
 *     responses:
 *       200:
 *         description: Timesheet PDF downloaded successfully
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *         headers:
 *           Content-Type:
 *             schema:
 *               type: string
 *               example: application/pdf
 *           Content-Disposition:
 *             schema:
 *               type: string
 *               example: attachment; filename=timesheet-2025-05-01.pdf
 *       400:
 *         description: Validation failed or no timesheets found
 *       401:
 *         description: Unauthorized - No valid authentication cookie
 *       403:
 *         description: Forbidden (not employee)
 *       404:
 *         description: No timesheets found for the given date range
 */
router.post(
  "/download/weekly",
  employeeAuth,
  TimesheetController.downloadTimesheet
);

export default router;
