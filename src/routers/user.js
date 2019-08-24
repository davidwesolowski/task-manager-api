const express = require('express');
const User = require('../models/user.js');
const auth = require('../middleware/auth.js');
const multer = require('multer');
const sharp = require('sharp');
const { sendWelcomeEmail, sendCancellationEmail } = require('../emails/account.js');
const router = new express.Router();

const upload = multer(
{ 
    //dest: 'avatars',
    limits:
    {
        fileSize: 1000000
    },
    fileFilter(req, file, callback)
    {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/))
            return callback(new Error('Invalid extension'));

        callback(undefined, true);
    }
    
});

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) =>
{
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250}).png().toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.send();
}, (error, req, res, next) =>
{
    res.status(400).send({ error: error.message });
});

router.delete('/users/me/avatar', auth, async (req, res) =>
{
    req.user.avatar = undefined;
    await req.user.save();
    res.status(200).send()
});

router.get('/users/:id/avatar', async (req, res) =>
{
    try
    {
        const user = await User.findById(req.params.id);
        
        if(!(user || user.avatar))
            throw new Error();
        
        res.set('Content-Type', 'image/jpg');
        res.send(user.avatar);
    }
    catch (error)
    {
        res.status(404).send();
    }
})

router.post('/users', async (req, res) =>
{
    let user = new User(req.body);
    try
    {
        await user.save();
        sendWelcomeEmail(user.email, user.name);
        let token = await user.generateAuthToken();
        res.status(201).send({ user, token });
    }
    catch (error)
    {
        res.status(400).send(error);
    }
});

router.post('/users/login', async (req, res) =>
{
    let email = req.body.email;
    let password = req.body.password;
    try
    {
        let user = await User.findByCredentials(email, password);
        let token = await user.generateAuthToken();
        res.send({ user, token });
    }
    catch (error)
    {
        res.status(400).send();
    }
});

router.post('/users/logout', auth, async (req, res) =>
{
    try
    {
        req.user.tokens = req.user.tokens.filter((token) => token.token !== req.token);
        await req.user.save();
        res.send();
    }
    catch (error)
    {
        res.status(500).send();
    }
});

router.post('/users/logoutAll', auth, async (req, res) =>
{
    try
    {
        req.user.tokens = [];
        await req.user.save();
        res.send();
    }
    catch (error)
    {
        res.status(500).send();
    }
});

router.patch('/users/me', auth, async (req, res) =>
{
    const allowedUpdates = ['name', 'password', 'email', 'age'];
    const updates = Object.keys(req.body);
    let isValid = updates.every((update) => allowedUpdates.includes(update));
    if (!isValid)
        return res.status(400).send({ error: 'Invalid operations' })
    try
    {
        updates.forEach((update) => req.user[update] = req.body[update]);
        await req.user.save();
        res.send(req.user);
    }
    catch (error)
    {
        res.status(400).send(error);
    }
});

router.delete('/users/me', auth, async (req, res) =>
{
    try
    {
        // let user = await User.findByIdAndDelete(_id);
        // if (!user)
        //     return res.status(404).send();
        await req.user.remove();
        sendCancellationEmail(req.user.email, req.user.name);
        res.send(req.user);
    }
    catch (error)
    {
        res.status(400).send();
    }
});

router.get('/users/me', auth, async (req, res) =>
{
    res.send(req.user);
});



// router.get('/users/:id', async (req, res) =>
// {
//     let _id = req.params.id;
//     try
//     {
//         let user = await User.findById(_id);
//         if (!user)
//         {
//             return res.status(404).send();
//         }
//         res.send(user);
//     }
//     catch (error)
//     {
//         res.status(500).send();
//     }
// });

// router.patch('/users/:id', async (req, res) =>
// {
//     const allowedUpdates = ['name', 'password', 'email', 'age'];
//     const updates = Object.keys(req.body);
//     let isValid = updates.every((update) => allowedUpdates.includes(update));
//     if (!isValid)
//         return res.status(400).send({ error: 'Invalid operations' })
//     let _id = req.params.id;
//     try
//     {
//         let user = await User.findById(_id);
//         updates.forEach((update) => user[update] = req.body[update]);
//         await user.save();
//         //let user = await User.findByIdAndUpdate(_id, req.body, { new: true, runValidators: true });
//         if (!user)
//             res.status(404).send();
//         res.send(user);
//     }
//     catch (error)
//     {
//         res.status(400).send(error);
//     }
// });


module.exports = router

// bez async-await
// app.post('/users', (req, res) =>
// {
//     let user = new User(req.body)
//     user.save().then(() => res.status(201).send('Created successfully')).catch((error) => 
//     {
//         res.status(400).send('Bad request')
//     });
// });

// app.get('/users', (req, res) =>
// {
//     User.find({}).then(users => res.send(users)).catch(error => res.status(500).send(error))
// }); 

// app.get('/users/:id', (req, res) =>
// {
//     const _id = req.params.id;
//     User.findById(_id).then(user =>
//     {
//         if (!user)
//             return res.status(404).send();
//         res.send(user);
//     }).catch(error => res.status(500).send())
// });