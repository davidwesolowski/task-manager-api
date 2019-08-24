const express = require('express');
const userRouter = require('./routers/user.js');
const taskRouter = require('./routers/task.js');

require('./db/mongoose.js');

const app = express();
const port = process.env.PORT;

// const multer = require('multer');
// const upload = multer(
// {
//     dest: 'images',
//     limits:
//     {
//         fileSize: 1000000
//     },
//     fileFilter(req, file, callback)
//     {
//         if (!file.originalname.match(/\.doc|docx$/))
//             return callback(new Error('Invalid extension'));
//         callback(undefined, true);
//     }
// })

// app.post('/upload', upload.single('upload'), (req, res) =>
// {
//     res.send(req.file);
// }, (error, req, res, next) =>
// {
//     res.status(400).send({ error: error.message });
// });

// app.use((req, res, next) =>
// {
//     if (req.method == 'GET')
//         res.send('Get method is not provided')
//     else
//         next();
// });

// app.use((req, res, next) =>
// {
//     if (req)
//         res.status(503).send('Be right back');

// });

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

app.listen(port, (req, res) =>
{
    console.log('Listening on port ' + port);
});
