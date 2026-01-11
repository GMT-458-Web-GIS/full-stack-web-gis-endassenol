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
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    // global auth (istersen böyle kalsın)
    security: [{ bearerAuth: [] }],
  },
  apis: ["./src/routes/*.js"],
};

module.exports = swaggerJSDoc(options);

