import { dirname, join } from "path";
import swaggerJsdoc from "swagger-jsdoc";
import { fileURLToPath } from "url";

// Get __dirname equivalent in ES Modules
const __dirname = dirname(fileURLToPath(import.meta.url));

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Healthcare Organization API",
      version: "1.0.0",
      description:
        "API documentation for Healthcare Organization Management System",
      contact: {
        name: "API Support",
        email: "support@healthcare.org",
      },
      license: {
        name: "Apache 2.0",
        url: "https://www.apache.org/licenses/LICENSE-2.0.html",
      },
    },
    servers: [
      {
        url: "https://orgserver-production.up.railway.app",
        description: "Production server",
      },
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "authToken",
          description: "HTTP-only authentication cookie",
        },
      },
      schemas: {
        AuthResponse: {
          type: "object",
          properties: {
            status: {
              type: "string",
              example: "success",
            },
            message: {
              type: "string",
              example: "Login successful",
            },
            data: {
              type: "object",
              properties: {
                user: {
                  $ref: "#/components/schemas/User",
                },
              },
            },
          },
        },
        User: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              example: 1,
            },
            email: {
              type: "string",
              format: "email",
              example: "admin@healthcare.org",
            },
            userType: {
              type: "string",
              enum: ["super_admin", "organization", "employee"],
              example: "organization",
            },
            orgName: {
              type: "string",
              example: "General Hospital",
            },
            name: {
              type: "string",
              example: "John Doe",
            },
            role: {
              type: "string",
              example: "admin",
            },
          },
        },
      },
    },
    security: [
      {
        cookieAuth: [],
      },
    ],
  },
  apis: [join(__dirname, "../routes/*.js")], // Now using the correct __dirname
};

const specs = swaggerJsdoc(options);

export default specs;
