import swaggerJSDoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Express API with TypeScript and TypeORM',
    version: '1.0.0',
    description: 'API documentation for Express.js project with TypeScript and TypeORM',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server',
    },
  ],
  securitySchemes: {
    bearerAuth: {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    },
  },
};

const options = {
  swaggerDefinition,
  // Đường dẫn đến các file chứa JSDoc annotations
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'], // Chỉ định nơi chứa các file route hoặc controller
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;