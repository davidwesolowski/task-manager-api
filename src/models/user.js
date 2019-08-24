const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('./task.js');

const userSchema = new mongoose.Schema({
    name:
    {
        type: String,
        required: true,
        trim: true,
    },
    email:
    {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate(value)
        {
            if (!validator.isEmail(value))
                throw new Error('Enter a correct email');
        }
    },
    password:
    {
        type: String,
        required: true,
        trim: true,
        minlength: 7,
        validate(value)
        {
            //if (value.length <= 6)
            //    throw new Error('Length of password needs to be greater than 6 characters');
            if (value.toLowerCase().includes('password'))
                throw new Error('Password cannot be password')
        }
    },
    age:
    { 
        type: Number,
        validate(value)
        {
            if (value < 0)
                throw new Error('Age must be a positive number!')
        },
        default: 0
    },
    tokens: 
    [{
        token:
        {
            type: String,
            required: true
        }
    }],
    avatar:
    {
        type: Buffer
    }
},
{
    timestamps: true
});

userSchema.virtual('tasks',
{
    ref: 'Task',    
    foreignField: 'owner',
    localField: '_id'
})

userSchema.methods.toJSON = function()
{
    const user = this;
    const userObject = user.toObject();
    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar;
    return userObject;
}

userSchema.methods.generateAuthToken = async function()
{
    let user = this;
    //let token = jwt.sign({ _id: user._id.toString() }, 'itsmyfirsttoken');
    let token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);
    user.tokens = user.tokens.concat({ token });
    await user.save();
    return token;
}

userSchema.statics.findByCredentials = async (email, password) =>
{
    let user = await User.findOne({ email });

    if (!user)
        throw new Error('Unable to login!');

    let isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
        throw new Error('Unable to login!');
    return user;
}

userSchema.pre('save', async function(next)
{
    const user = this;
    if (user.isModified('password'))
    {
        user.password = await bcrypt.hash(user.password, 8);
    }
    next();
});

userSchema.pre('remove', async function(next)
{
    const user = this;
    await Task.deleteMany({ owner: user._id });
    next();

});

const User = mongoose.model('User', userSchema);

module.exports = User;