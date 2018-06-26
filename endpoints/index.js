const express = require('express');
const router = express.Router();

const userController = require('../controllers/user');

/* GET home page. */
router.get('/', (req, res, next) => {
    res.status(200).send({status: 'success', message: 'we dey'});
});

router.get('/users', userController.getAllUsers);

module.exports = router;
