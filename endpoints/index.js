const express = require('express');
const router = express.Router();

const userController = require('../controllers/user');

/* GET home page. */
router.get('/', (req, res) => {
    res.status(200).send({status: 'success', message: 'we dey'});
});

router.get('/users', userController.getAllUsers);
router.post('/users', userController.createUser);
router.put('/users', userController.updateUser);
router.get('/users/:userId', userController.getUserById);


module.exports = router;
