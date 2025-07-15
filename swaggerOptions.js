const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Student AI Helper API',
            version: '1.0.0',
            description: 'Документация API для проекта Student AI Helper',
        },
        servers: [
            {
                url: 'http://localhost:8080',
            },
        ],
    },
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            }
        }
    },
    apis: ['./src/routes/*.js' , './src/routes/testRoutes/*.js'],
};

module.exports = options;
