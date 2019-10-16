var express = require('express');
var router = express.Router();  
const session = require('express-session');
const {Client } = require('pg');    
const redis = require('redis');
const redisClient = redis.createClient();
const redisStore = require('connect-redis')(session);
//-------------Database Information----------------// 
const client = new Client({ 
    user:'kunaldubey',
    host:'127.0.0.1',
    database:'vrit',
    password:'',
    port:5432,
}) 
client.connect();
//-------------Checking OTP------------------------//
router.get('/', function(req, resp, next) {     
    redisClient.exists('rollNum', function(err, reply) {
        if (reply === 1) {
            console.log('exists'); 
            resp.send('Roll num is there').status(200);
        } else {
            console.log('doesn\'t exist'); 
            resp.send('Roll num is  not there').status(200);
        }
    }); 

}); 


module.exports = router;
