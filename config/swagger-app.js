const swaggerUiApp = require('swagger-ui-express');
const swaggerDocumentApp = require('swagger-jsdoc');
require('dotenv').config();

const swaggerOptionsApp = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
          title: 'APP API Documentation',
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
      apis: ['./app/router/*.js'],
};

const swaggerDocsApp = swaggerDocumentApp(swaggerOptionsApp);
const app_swaggerui = swaggerUiApp.setup(swaggerDocsApp, {
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
const app_sawgerserver = swaggerUiApp.serve;

module.exports = {
    app_sawgerserver,
    app_swaggerui,
}