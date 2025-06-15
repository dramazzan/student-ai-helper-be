const express  = require('express')
const cors = require('cors')
const summaryRoutes = require('./routes/summaryRoutes')
const authRoutes = require('./routes/authRoutes')
const testRoutes = require('./routes/testRoutes');

const app = express()

app.use(cors())
app.use(express.json())

app.get('/', (req, res)=>{
    res.send("Server is running")
})

app.use('/api/auth', authRoutes);
app.use('/api/summary', summaryRoutes);
app.use('/api/test', testRoutes);


module.exports = app