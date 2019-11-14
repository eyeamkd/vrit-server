var express = require('express');
var router = express.Router(); 
const MONGO_DATABASE = 'mongodb://localhost:27017/vritDB'; 
const mongoose = require('mongoose'); 
const usersController = require('../controllers/usersController');

mongoose.connect(MONGO_DATABASE,{ 
  useNewUrlParser:true,
  useCreateIndex:true,
  useFindAndModify:true
}).then(connectionObject=>{ 
  console.log("Mongo Db database Connected"); 
  console.log("Connections are ",connectionObject.connections); 
});  

/* GET users listing. */
router  
    .route('/')
    .get(usersController.getUserInfo);

router 
    .route('/info/:id') 
    .get(usersController.getUserInfo)
module.exports = router;
