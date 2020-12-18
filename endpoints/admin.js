const express = require('express');
const router = express.Router();
const SchemaValidator = require('../middlewares/SchemaValidator');

const validateAdminRequest = SchemaValidator("admin", true);

const adminController = require('../controllers/admin');
const baseController = require('../controllers/base');

router.post('/login', validateAdminRequest, adminController.login);
router.post('/create', validateAdminRequest, baseController.verifyAccessToken, baseController.isSuperAdmin, adminController.createAdmin);

router.get('/users', validateAdminRequest, baseController.verifyAccessToken, baseController.isAdmin, adminController.getAllUsers);

module.exports = router;
