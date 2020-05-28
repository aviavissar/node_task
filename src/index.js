const express = require('express');
require('./db/mongoose')
const taskRouter = require('./routers/tasks')
const userRouter = require('./routers/users')

const app = express();
const port = process.env.PORT;

// app.use((req, res, next) => {
//     res.status(503).send('the site is under maintenance')
// })

app.use(express.json())
app.use(taskRouter, userRouter)

app.listen(port, () => {
    console.log('server is up in port ' + port)
})

// const multer = require('multer');
// const upload = multer({
//     dest: 'images'
// })
// app.post('/upload', upload.single('upload'), (req, res) => {
//     res.send();

// })