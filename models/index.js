const express = require('express')
const bodyparser = require('body-parser')  
const app = express()
const user_routes = require('./routes/user_routes')
const task_routes = require('./routes/task_routes')
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/users',user_routes)
app.use('/tasks',task_routes)
require('dotenv').config()
require('./db')

const port = process.env.PORT

app.use(bodyparser.json())

app.get('/' , (req,res)=>{
    res.json({
        message : 'Task Manager App'
    })
})
app.listen(port , ()=>{
    console.log(`server is running on port ${port}`)
})