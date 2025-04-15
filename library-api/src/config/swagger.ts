import swaggerJSDoc from "swagger-jsdoc";
import { version } from "../../package.json";

// Swagger definition
const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Library API Documentation",
    version,
    description: "Documentation for the Library REST API",
    license: {
      name: "ISC",
      url: "https://opensource.org/licenses/ISC",
    },
    contact: {
      name: "API Support",
      email: "support@library-api.com",
    },
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Development server",
    },
    {
      url: "https://api.library-api.com",
      description: "Production server",
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
};

// Options for the swagger docs
const options = {
  swaggerDefinition,
  // Paths to files containing OpenAPI definitions
  apis: ["./src/routes/*.ts", "./src/routes/admin/*.ts", "./src/models/*.ts"],
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
