const express = require('express');
const router = express.Router();

const users = require('./users');
const admin = require('./admin');

/* GET home page. */
router.get('/', (req, res) => {
    res.status(200).send({status: 'success', message: 'Welcome!'});
});

router.use('/admin', admin);
router.use('/users', users);

module.exports = router;
