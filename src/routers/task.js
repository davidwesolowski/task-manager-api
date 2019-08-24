const express = require('express');
const Task = require('../models/task.js');
const auth = require('../middleware/auth.js');
const router = new express.Router();

router.post('/tasks', auth, async (req, res) =>
{
    //let task = new Task(req.body);
    let task = new Task(
        {
            ...req.body,
            owner: req.user._id
        }
    )
    try
    {
        await task.save();
        res.status(201).send(task);
    }
    catch (error)
    {
        res.status(400).send(error);
    }
});

router.patch('/tasks/:id', auth, async (req, res) =>
{
    const allowedUpdates = ['description', 'completed'];
    const updates = Object.keys(req.body);
    let isValid = updates.every((update) => allowedUpdates.includes(update));
    if (!isValid)
        return res.status(400).send({ error: 'Invalid operations' });
    let _id = req.params.id;
    try
    {
        //let task = await Task.findByIdAndUpdate(_id, req.body, { new: true, runValidators: true });
        //let task = await Task.findById(_id);
        let task = await Task.findOne({ _id, owner: req.user._id });
        if (!task)
            return res.status(404).send();

        updates.forEach((update) => task[update] = req.body[update]);
        await task.save();
        res.send(task);
    }
    catch (error)
    {
        res.status(400).send(error);
    }
});

router.delete('/tasks/:id', auth, async (req, res) =>
{
    let _id = req.params.id;
    try
    {
        //let task = await Task.findByIdAndDelete(_id);
        let task = await Task.findOne({ _id, owner: req.user._id });
        if (!task)
            return res.status(404).send();
        await task.remove();
        res.send(task);
    }
    catch (error)
    {
        res.status(400).send();
    }
});

router.get('/tasks', auth, async (req, res) =>
{
    try
    {
        //let tasks = await Task.find({ owner: req.user._id });
        //res.send(tasks)
        //await req.user.populate('tasks').execPopulate();
        const match = {};
        const sort = {};
        
        if (req.query.completed)
        {
            match.completed = req.query.completed === 'true';
        }

        if (req.query.sortBy)
        {
            let parts = req.query.sortBy.split(':');
            sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
        }

        await req.user.populate(
        {
            path: 'tasks',
            match,
            options:
            {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate();
        res.send(req.user.tasks)
    }
    catch (error)
    {
        res.status(500).send();
    }
});

router.get('/tasks/:id', auth, async (req, res) =>
{
    let _id = req.params.id;
    try
    {
        //let task = await Task.findById(_id);
        let task = await Task.findOne({ _id, owner: req.user._id })
        if (!task)
            return res.status(404).send();
        res.send(task);
    }
    catch (error)
    {
        res.status(500).send();
    }
});



module.exports = router;



// app.post('/tasks', (req, res) =>
// {
//     const task = new Task(req.body);
//     task.save().then(() => res.status(201).send(task)).catch((error) => res.status(400).send('Bad request'));
// });

// app.get('/tasks', (req, res) =>
// {
//     Task.find({}).then(tasks => res.send(tasks)).catch(error => res.status(500).send(error))
// });

// app.get('/tasks/:id', (req, res) =>
// {
//    const _id = req.params.id;
//    Task.findById(_id).then(task =>
//    {
//         if (!task)
//             return res.status(404).send();
//         res.send(task);
//    }).catch(error => res.status(500).send());
// });