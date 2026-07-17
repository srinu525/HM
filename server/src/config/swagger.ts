import type { Options } from "swagger-jsdoc";

const swaggerOptions: Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "HM Hospital Management API",
      version: "1.0.0",
      description: "Hospital Management System REST API with multi-tenancy support",
      contact: { name: "HM Team" },
    },
    servers: [
      { url: "http://localhost:5000/api/v1", description: "Development" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        SuccessResponse: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            message: { type: "string" },
            data: {},
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string" },
          },
        },
        User: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string" },
            email: { type: "string", format: "email" },
            role: { type: "string", enum: ["SUPER_ADMIN", "ADMIN", "RECEPTIONIST", "DOCTOR", "PHARMACIST"] },
            organizationId: { type: "string", format: "uuid" },
          },
        },
        Patient: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            patientId: { type: "string" },
            name: { type: "string" },
            phone: { type: "string" },
            email: { type: "string" },
            gender: { type: "string", enum: ["MALE", "FEMALE", "OTHER"] },
            age: { type: "integer" },
            dob: { type: "string", format: "date-time" },
            organizationId: { type: "string", format: "uuid" },
          },
        },
        Appointment: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            token: { type: "integer" },
            status: { type: "string", enum: ["SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"] },
            date: { type: "string", format: "date-time" },
            patientId: { type: "string" },
            doctorId: { type: "string" },
            consultationFee: { type: "number" },
          },
        },
        Medicine: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string" },
            price: { type: "number" },
            stock: { type: "integer" },
            expiryDate: { type: "string", format: "date-time" },
            batchNumber: { type: "string" },
            reorderLevel: { type: "integer" },
          },
        },
        Organization: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string" },
            slug: { type: "string" },
            email: { type: "string" },
            phone: { type: "string" },
            isActive: { type: "boolean" },
          },
        },
        Notification: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            message: { type: "string" },
            type: { type: "string" },
            isRead: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./src/modules/*/routes.ts"],
};

export default swaggerOptions;
