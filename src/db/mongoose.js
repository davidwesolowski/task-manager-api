const mongoose = require('mongoose');

//const connectionURL = 'mongodb://localhost:27017/task-manager-api'
const connectionURL = process.env.MONGODB_URL

mongoose.connect(connectionURL, 
{
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
});

