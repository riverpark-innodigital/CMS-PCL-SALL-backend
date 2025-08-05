const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('swagger-jsdoc');
require('dotenv').config();

const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
          title: 'CMS And APP API Documentation',
          version: '1.0.0',
          description: 'API documentation',
        },
        servers: [
          {
            url: process.env.API_DOC_URL,
          },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT', 
                },
            },
        },
        security: [
            {
              bearerAuth: [],
            },
        ],
      },
      apis: ['./routers/*.js'],
};

const swaggerDocs = swaggerDocument(swaggerOptions);
const swaggerui = swaggerUi.setup(swaggerDocs, {
    swaggerOptions: {
        requestInterceptor: (req) => {
            const token = localStorage.getItem('authToken');
            if (token) {
                req.headers['Authorization'] = `Bearer ${token}`;
            }
            return req;
        },
        responseInterceptor: (res) => {
            // If the response contains a token, store it for future requests
            if (res.body && res.body.token) {
                localStorage.setItem('authToken', res.authToken);
            }
            return res;
        }
    }
});
const sawgerserver = swaggerUi.serve;

module.exports = {
    sawgerserver,
    swaggerui,
}