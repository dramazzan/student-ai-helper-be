const express  = require('express')
const cors = require('cors')
const summaryRoutes = require('./routes/summaryRoutes')
const authRoutes = require('./routes/authRoutes')
const testRoutes = require('./routes/testRoutes');
const passingRoutes = require('./routes/testPassingRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const progressRoutes = require('./routes/progressRoutes')
const analyticsRoutes = require('./routes/analyticsRoutes');
const testDownloadRoutes = require('./routes/testDownloadRoutes');
const cookieParser = require('cookie-parser')
require('./utils/clearUploadsFolder');

const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const swaggerOptions = require('../swaggerOptions');

const app = express()

const swaggerSpec = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true,
};


app.use(cors(corsOptions))
app.use(express.json())
app.use(cookieParser())

app.get('/', (req, res)=>{
    res.send("Server is running")
})

app.use('/api/auth', authRoutes);
app.use('/api/summary', summaryRoutes);
app.use('/api/test', testRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/test/passing' , passingRoutes)
app.use('/api/progress', progressRoutes)
app.use('/api/analytics' , analyticsRoutes)
app.use('/api/tests' , testDownloadRoutes )

module.exports = app