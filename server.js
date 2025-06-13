const app = require('./src/app')
require('dotenv').config()
const mongoose = require('mongoose')

const port = process.env.PORT || 3000

mongoose.connect(process.env.MONGODB_URI).then(()=>{
    console.log('Connected to MongoDB')
    app.listen(port, ()=>{
    console.log(`Server is running on port http://localhost:${port}`)
})
}).catch(()=>{
    console.log('Failed to connect MongoDB')
})

