const express = require('express');
const router = express.Router();
const SchemaValidator = require('../middlewares/SchemaValidator');

const validateRequest = SchemaValidator(true);

const userController = require('../controllers/user');

router.get('/', userController.getAllUsers);
router.post('/', validateRequest, userController.createUser);
router.put('/', validateRequest, userController.updateUser);

module.exports = router;
