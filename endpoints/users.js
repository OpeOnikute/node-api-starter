const express = require('express');
const router = express.Router();
const SchemaValidator = require('../middlewares/SchemaValidator');

const validateRequest = SchemaValidator(true);

const userController = require('../controllers/user');

router.post('/signup', validateRequest, userController.signup);
router.post('/login', validateRequest, userController.login);
router.put('/', validateRequest, userController.updateUser);
router.post('/forgot-password', validateRequest, userController.forgotPassword);
router.post('/change-password', validateRequest, userController.changePassword);

module.exports = router;
