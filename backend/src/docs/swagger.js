const swaggerJSDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Role-Based Urban Event & Facility GIS API",
      version: "1.0.0",
      description: "Web GIS backend API documentation",
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Local development server",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {                // 🔥 logs.routes.js ile birebir
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    // 🔐 global auth (authorize bir kez, her yerde çalışsın)
    security: [{ BearerAuth: [] }],
  },
  apis: ["./src/routes/*.js"],
};

module.exports = swaggerJSDoc(options);
