var express = require('express');
var router = express.Router();  
const pollsController = require('../controllers/pollsController');

router  
    .route('/')
    .get(pollsController.getPolls);

module.exports = router;

