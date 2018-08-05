const express = require('express');
const router = express.Router();

const userController = require('../controllers/user');

router.get('/', userController.getAllUsers);
router.post('/', userController.createUser);
router.put('/', userController.updateUser);
router.get('/:userId', userController.getUserById);


module.exports = router;
