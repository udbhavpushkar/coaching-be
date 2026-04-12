const baseResponses = {
  Unauthorized: {
    description: "Unauthorized"
  },
  Forbidden: {
    description: "Forbidden"
  },
  NotFound: {
    description: "Resource not found"
  }
};

const openApiSpec = {
  openapi: "3.0.0",
  info: {
    title: "InstituteOS API",
    version: "1.0.0",
    description: "Multi-tenant Coaching ERP backend for India"
  },
  servers: [{ url: "/api/v1", description: "API v1" }],
  tags: [
    { name: "Auth" },
    { name: "Institutes" },
    { name: "Users" },
    { name: "Courses" },
    { name: "Batches" },
    { name: "Students" },
    { name: "Fees" },
    { name: "Attendance" },
    { name: "Dashboard" },
    { name: "Subscriptions" },
    { name: "Activity Logs" }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    },
    schemas: {
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string", format: "password" }
        }
      },
      InstituteCreateRequest: {
        type: "object",
        required: ["name", "email", "phone", "address", "admin"],
        properties: {
          name: { type: "string" },
          email: { type: "string", format: "email" },
          phone: { type: "string" },
          address: { type: "string" },
          plan: { type: "string", enum: ["FREE", "BASIC", "PRO"] },
          trialEndsAt: { type: "string", format: "date-time" },
          admin: {
            type: "object",
            required: ["name", "email", "phone", "password"],
            properties: {
              name: { type: "string" },
              email: { type: "string", format: "email" },
              phone: { type: "string" },
              password: { type: "string", format: "password" }
            }
          }
        }
      },
      UserCreateRequest: {
        type: "object",
        required: ["name", "email", "phone", "password", "role"],
        properties: {
          name: { type: "string" },
          email: { type: "string", format: "email" },
          phone: { type: "string" },
          password: { type: "string", format: "password" },
          role: { type: "string", enum: ["ADMIN", "TEACHER", "STUDENT"] },
          instituteId: { type: "string", format: "uuid" }
        }
      },
      CourseRequest: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          duration: { type: "string" },
          fees: { type: "number" }
        }
      },
      BatchRequest: {
        type: "object",
        properties: {
          name: { type: "string" },
          courseId: { type: "string", format: "uuid" },
          teacherId: { type: "string", format: "uuid", nullable: true },
          startTime: { type: "string", format: "date-time" },
          endTime: { type: "string", format: "date-time" }
        }
      },
      StudentRequest: {
        type: "object",
        properties: {
          user: {
            type: "object",
            properties: {
              name: { type: "string" },
              email: { type: "string", format: "email" },
              phone: { type: "string" },
              password: { type: "string", format: "password" }
            }
          },
          fatherName: { type: "string" },
          enrollmentNumber: { type: "string" },
          courseId: { type: "string", format: "uuid" },
          batchId: { type: "string", format: "uuid" }
        }
      },
      FeeCreateRequest: {
        type: "object",
        properties: {
          studentId: { type: "string", format: "uuid" },
          totalAmount: { type: "number" }
        }
      },
      PaymentRequest: {
        type: "object",
        properties: {
          amount: { type: "number" },
          paymentDate: { type: "string", format: "date-time" },
          mode: { type: "string", enum: ["CASH", "UPI", "CARD"] }
        }
      },
      AttendanceRequest: {
        type: "object",
        properties: {
          studentId: { type: "string", format: "uuid" },
          batchId: { type: "string", format: "uuid" },
          date: { type: "string", format: "date-time" },
          status: { type: "string", enum: ["PRESENT", "ABSENT"] }
        }
      },
      SubscriptionRequest: {
        type: "object",
        properties: {
          instituteId: { type: "string", format: "uuid" },
          plan: { type: "string", enum: ["FREE", "BASIC", "PRO"] },
          status: { type: "string", enum: ["ACTIVE", "EXPIRED", "CANCELLED"] },
          startDate: { type: "string", format: "date-time" },
          endDate: { type: "string", format: "date-time" }
        }
      }
    },
    responses: baseResponses
  },
  security: [{ bearerAuth: [] }],
  paths: {
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login and get JWT",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" }
            }
          }
        },
        responses: { 200: { description: "Login successful" } }
      }
    },
    "/institutes": {
      post: {
        tags: ["Institutes"],
        summary: "Create institute",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/InstituteCreateRequest" }
            }
          }
        },
        responses: { 201: { description: "Institute created" }, 401: { $ref: "#/components/responses/Unauthorized" } }
      },
      get: {
        tags: ["Institutes"],
        summary: "List institutes",
        parameters: [
          { in: "query", name: "page", schema: { type: "integer" } },
          { in: "query", name: "limit", schema: { type: "integer" } },
          { in: "query", name: "search", schema: { type: "string" } },
          { in: "query", name: "isActive", schema: { type: "boolean" } }
        ],
        responses: { 200: { description: "Institute list" } }
      }
    },
    "/institutes/{instituteId}/status": {
      patch: {
        tags: ["Institutes"],
        summary: "Activate or deactivate institute",
        parameters: [{ in: "path", name: "instituteId", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { isActive: { type: "boolean" } }
              }
            }
          }
        },
        responses: { 200: { description: "Institute status updated" } }
      }
    },
    "/users": {
      post: {
        tags: ["Users"],
        summary: "Create user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UserCreateRequest" }
            }
          }
        },
        responses: { 201: { description: "User created" } }
      },
      get: {
        tags: ["Users"],
        summary: "List users",
        parameters: [
          { in: "query", name: "page", schema: { type: "integer" } },
          { in: "query", name: "limit", schema: { type: "integer" } },
          { in: "query", name: "search", schema: { type: "string" } },
          { in: "query", name: "role", schema: { type: "string" } },
          { in: "query", name: "instituteId", schema: { type: "string", format: "uuid" } }
        ],
        responses: { 200: { description: "User list" } }
      }
    },
    "/users/{userId}": {
      delete: {
        tags: ["Users"],
        summary: "Soft delete user",
        parameters: [{ in: "path", name: "userId", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { 200: { description: "User deleted" } }
      }
    },
    "/courses": {
      post: {
        tags: ["Courses"],
        summary: "Create course",
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/CourseRequest" } } } },
        responses: { 201: { description: "Course created" } }
      },
      get: {
        tags: ["Courses"],
        summary: "List courses",
        parameters: [
          { in: "query", name: "page", schema: { type: "integer" } },
          { in: "query", name: "limit", schema: { type: "integer" } },
          { in: "query", name: "search", schema: { type: "string" } }
        ],
        responses: { 200: { description: "Course list" } }
      }
    },
    "/courses/{courseId}": {
      get: {
        tags: ["Courses"],
        summary: "Get course",
        parameters: [{ in: "path", name: "courseId", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { 200: { description: "Course details" } }
      },
      patch: {
        tags: ["Courses"],
        summary: "Update course",
        parameters: [{ in: "path", name: "courseId", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/CourseRequest" } } } },
        responses: { 200: { description: "Course updated" } }
      },
      delete: {
        tags: ["Courses"],
        summary: "Soft delete course",
        parameters: [{ in: "path", name: "courseId", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { 200: { description: "Course deleted" } }
      }
    },
    "/batches": {
      post: {
        tags: ["Batches"],
        summary: "Create batch",
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/BatchRequest" } } } },
        responses: { 201: { description: "Batch created" } }
      },
      get: {
        tags: ["Batches"],
        summary: "List batches",
        parameters: [
          { in: "query", name: "page", schema: { type: "integer" } },
          { in: "query", name: "limit", schema: { type: "integer" } },
          { in: "query", name: "search", schema: { type: "string" } },
          { in: "query", name: "courseId", schema: { type: "string", format: "uuid" } },
          { in: "query", name: "teacherId", schema: { type: "string", format: "uuid" } }
        ],
        responses: { 200: { description: "Batch list" } }
      }
    },
    "/batches/{batchId}": {
      get: {
        tags: ["Batches"],
        summary: "Get batch",
        parameters: [{ in: "path", name: "batchId", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { 200: { description: "Batch details" } }
      },
      patch: {
        tags: ["Batches"],
        summary: "Update batch",
        parameters: [{ in: "path", name: "batchId", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/BatchRequest" } } } },
        responses: { 200: { description: "Batch updated" } }
      },
      delete: {
        tags: ["Batches"],
        summary: "Soft delete batch",
        parameters: [{ in: "path", name: "batchId", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { 200: { description: "Batch deleted" } }
      }
    },
    "/students": {
      post: {
        tags: ["Students"],
        summary: "Create student",
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/StudentRequest" } } } },
        responses: { 201: { description: "Student created" } }
      },
      get: {
        tags: ["Students"],
        summary: "List students",
        parameters: [
          { in: "query", name: "page", schema: { type: "integer" } },
          { in: "query", name: "limit", schema: { type: "integer" } },
          { in: "query", name: "search", schema: { type: "string" } },
          { in: "query", name: "batchId", schema: { type: "string", format: "uuid" } },
          { in: "query", name: "courseId", schema: { type: "string", format: "uuid" } }
        ],
        responses: { 200: { description: "Student list" } }
      }
    },
    "/students/{studentId}": {
      get: {
        tags: ["Students"],
        summary: "Get student",
        parameters: [{ in: "path", name: "studentId", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { 200: { description: "Student details" } }
      },
      patch: {
        tags: ["Students"],
        summary: "Update student",
        parameters: [{ in: "path", name: "studentId", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/StudentRequest" } } } },
        responses: { 200: { description: "Student updated" } }
      },
      delete: {
        tags: ["Students"],
        summary: "Soft delete student",
        parameters: [{ in: "path", name: "studentId", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { 200: { description: "Student deleted" } }
      }
    },
    "/fees": {
      post: {
        tags: ["Fees"],
        summary: "Create fee structure",
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/FeeCreateRequest" } } } },
        responses: { 201: { description: "Fee created" } }
      },
      get: {
        tags: ["Fees"],
        summary: "List fee records",
        parameters: [
          { in: "query", name: "page", schema: { type: "integer" } },
          { in: "query", name: "limit", schema: { type: "integer" } },
          { in: "query", name: "studentId", schema: { type: "string", format: "uuid" } }
        ],
        responses: { 200: { description: "Fee list" } }
      }
    },
    "/fees/summary": {
      get: {
        tags: ["Fees"],
        summary: "Get revenue and due summary",
        responses: { 200: { description: "Fee summary" } }
      }
    },
    "/fees/{feeId}": {
      get: {
        tags: ["Fees"],
        summary: "Get fee record",
        parameters: [{ in: "path", name: "feeId", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { 200: { description: "Fee details" } }
      }
    },
    "/fees/{feeId}/payments": {
      post: {
        tags: ["Fees"],
        summary: "Record payment",
        parameters: [{ in: "path", name: "feeId", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/PaymentRequest" } } } },
        responses: { 201: { description: "Payment recorded" } }
      }
    },
    "/attendance": {
      post: {
        tags: ["Attendance"],
        summary: "Mark attendance",
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/AttendanceRequest" } } } },
        responses: { 201: { description: "Attendance marked" } }
      }
    },
    "/attendance/report": {
      get: {
        tags: ["Attendance"],
        summary: "Attendance report",
        parameters: [
          { in: "query", name: "page", schema: { type: "integer" } },
          { in: "query", name: "limit", schema: { type: "integer" } },
          { in: "query", name: "studentId", schema: { type: "string", format: "uuid" } },
          { in: "query", name: "batchId", schema: { type: "string", format: "uuid" } },
          { in: "query", name: "dateFrom", schema: { type: "string", format: "date-time" } },
          { in: "query", name: "dateTo", schema: { type: "string", format: "date-time" } }
        ],
        responses: { 200: { description: "Attendance report" } }
      }
    },
    "/dashboard": {
      get: {
        tags: ["Dashboard"],
        summary: "Dashboard metrics",
        responses: { 200: { description: "Dashboard metrics" } }
      }
    },
    "/subscriptions": {
      post: {
        tags: ["Subscriptions"],
        summary: "Create subscription",
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/SubscriptionRequest" } } } },
        responses: { 201: { description: "Subscription created" } }
      },
      get: {
        tags: ["Subscriptions"],
        summary: "List subscriptions",
        parameters: [
          { in: "query", name: "page", schema: { type: "integer" } },
          { in: "query", name: "limit", schema: { type: "integer" } },
          { in: "query", name: "instituteId", schema: { type: "string", format: "uuid" } },
          { in: "query", name: "status", schema: { type: "string" } }
        ],
        responses: { 200: { description: "Subscription list" } }
      }
    },
    "/activity-logs": {
      get: {
        tags: ["Activity Logs"],
        summary: "List activity logs",
        parameters: [
          { in: "query", name: "page", schema: { type: "integer" } },
          { in: "query", name: "limit", schema: { type: "integer" } },
          { in: "query", name: "userId", schema: { type: "string", format: "uuid" } },
          { in: "query", name: "instituteId", schema: { type: "string", format: "uuid" } },
          { in: "query", name: "action", schema: { type: "string" } },
          { in: "query", name: "entity", schema: { type: "string" } }
        ],
        responses: { 200: { description: "Activity log list" } }
      }
    }
  }
};

module.exports = openApiSpec;
