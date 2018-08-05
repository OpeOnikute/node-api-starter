const express = require('express');
const router = express.Router();

const users = require('./users');

/* GET home page. */
router.get('/', (req, res) => {
    res.status(200).send({status: 'success', message: 'Welcome!'});
});

router.use('/users', users);

module.exports = router;
