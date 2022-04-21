const express = require('express');
const UserController = require('../controllers/users');

const router = express.Router();

// POST /account/ creates a new user
router.post('/', async (req, res, next) => {
    try {
        const body = req.body;
        console.log(body);
        const result = await UserController.createUser(body.username, body.name, body.email, body.password, 1);
        res.status(201).json(result);
    } catch (err) {
        console.error('Failed to create new user:', err);
        res.status(400).json({ message: err.toString() });
    }
    next();
})


module.exports = router;