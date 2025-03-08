const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
const User = require('../user');
router.get('/' , (req,res)=>{
    res.send('Hello from user routes')
})

// register a new user
router.post('/register', async (req, res) => {
    try {
        console.log("Incoming Data:", req.body);  // Debugging line

        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const user = new User({ name, email, password });
        await user.save();
        res.status(201).json({ user, message: 'User created successfully' });

    } catch (err) {
        console.error("Error:", err);
        res.status(400).json({ error: err.message || "Something went wrong" });
    }
});
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            throw new Error('Invalid login credentials');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error('Invalid login credentials');
        }

        const token = jwt.sign({ _id: user.id.toString() }, process.env.JWT_SECRET_KEY);

        // Log the current tokens array before saving
        console.log('User Tokens before saving:', user.tokens);

        // Add the token to the user's tokens array
        user.tokens = user.tokens.concat({ token });  
        await user.save();

        res.send({ user, token, message: 'User logged in successfully' });
    } catch (err) {
        res.status(400).send({ error: err.message });
    }
});

module.exports = router;

