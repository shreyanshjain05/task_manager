const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const user = require('../user');
const Task = require('../task');

router.get('/test', auth, (req, res) => {
    res.json({
        message: 'Task routes are working',
        user: req.user
    });
});

// create the task
router.post('/create', auth, async (req, res) => {
    try {
        const { title, description } = req.body;
        if (!title || !description) {
            return res.status(400).json({ error: "All fields are required" });
        }

        // extract description and completed from req.body and owner from req.user
        const task = new Task({ 
            ...req.body, 
            owner: req.user._id});
        await task.save();
        res.status(201).json({ task, message: 'Task created successfully' });

    } catch (err) {
        console.error("Error:", err);
        res.status(400).json({ error: err.message || "Something went wrong" });
    }
});

// get all tasks
router.get('/', auth, async (req, res) => {
    try {
        // Fetch tasks for the authenticated user
        const tasks = await Task.find({ owner: req.user._id });

        // Respond with a success message and the tasks
        res.status(200).json({ tasks, message: 'All tasks fetched successfully' });
    } catch (err) {
        // Handle any errors and send the response with an error message
        console.error("Error:", err);
        res.status(400).json({ error: err.message || "Something went wrong" });
    }
});

// fetch a single task
router.get('/:id' , auth , async(req,res)=>{
    const taskid = req.params.id;
    try{
        const task = await Task.findOne({_id:taskid , owner:req.user._id});
        if(!task){
            return res.status(404).json({error:'Task not found'})
        }
        res.status(200).json({task})
    }
    catch(err){
        console.error("Error:", err);
        res.status(400).json({ error: err.message || "Something went wrong" });
    }
})

// update a task by id
router.patch('/:id' , auth , async(req,res)=>{
    const taskid = req.params.id;
    const updates = Object.keys(req.body)
    const allowedUpdates = ['title','description','completed']
    const validOperation = updates.every((update)=>allowedUpdates.includes(update))
    if(!validOperation){
        return res.status(400).json({error:'Invalid updates'})
    }
    try{
        const task = await Task.findOne({_id:taskid , owner:req.user._id});
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }
        updates.forEach(taskUpdate => task[taskUpdate] = req.body[taskUpdate]);
        await task.save();
        res.status(200).json({ task, message: 'Task updated successfully' });
    }
    catch(err){
        console.error("Error:", err);
        res.status(400).json({ error: err.message || "Something went wrong" });
    }

})

// delete a task by id
router.delete('/:id' , auth , async(req,res)=>{
    const taskid = req.params.id;
    try{
        const task = await Task.findOneAndDelete({_id:taskid , owner:req.user._id});
        if(!task){
            return res.status(404).json({error:'Task not found'})
        }
        res.status(200).json({task , message:'Task deleted successfully'})
    }
    catch(err){
        console.error("Error:", err);
        res.status(400).json({ error: err.message || "Something went wrong" });
    }
})
module.exports = router;