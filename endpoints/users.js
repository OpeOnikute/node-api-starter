const express = require('express');
const router = express.Router();
const SchemaValidator = require('../middlewares/SchemaValidator');

const validateRequest = SchemaValidator(true);

const userController = require('../controllers/user');

router.get('/', userController.getAllUsers);
router.post('/signup', validateRequest, userController.signup);
router.post('/login', validateRequest, userController.login);
router.put('/', validateRequest, userController.updateUser);

module.exports = router;
