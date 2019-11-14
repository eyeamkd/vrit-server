var express = require('express');
var router = express.Router();   
const session = require('express-session');
var nodemailer = require('nodemailer');
const assert = require('assert');   
const {Client } = require('pg');    
const redis = require('redis');
const redisClient = redis.createClient(); 
const MONGO_DATABASE = 'mongodb://localhost:27017/vritDB'; 
const mongoose = require('mongoose'); 
const users = require('../models/usersModel');
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
mongoose.connect(MONGO_DATABASE,{ 
    useNewUrlParser:true,
    useCreateIndex:true,
    useFindAndModify:true
}).then(connectionObject=>{ 
    console.log("Mongo Db database Connected"); 
    console.log("Connections are ",connectionObject.connections); 
}); 


//-------------Nodemailer Information--------------//
let transporter = nodemailer.createTransport({ 
    service:'Gmail',
    auth:{ 
        user:'kunaldubey2297@gmail.com',
        pass:'kunalsunaina'
    }
});    

//-------------OTP Creation Function---------------//
getOtp=(rollnumber)=>{ 
    max = Math.ceil(10000) 
    min = Math.floor(1001)   
    console.log("inside otp"); 
    console.log("roll number passed "+rollnumber);
    const  otp = Math.floor(Math.random()*(max-min)+min);  
    var values =[otp,rollnumber]
    const otpQuery = `update users set otp=$1 where rollnumber=$2` 
    client.query(otpQuery,values,(err,res)=>{  
        if(err){ 
            console.log(err.stack);
        }else{ 
            console.log(res);
        }
    }); 
    return otp;
}
//-------------Signin the users ------------------//
router.post('/',function(req,resp){     
    var values = [req.body.rollnumber];   
    var rollnumber = req.body.rollnumber;   
    redisClient.setex('rollNum',3600,rollnumber);
    redisClient.exists('rollNum', function(err, reply) {
        if (reply === 1) {
            console.log('exists');
        } else {
            console.log('doesn\'t exist'); 
        }
    });
    const mailQuery = 'SELECT email FROM users WHERE rollnumber = $1'  
    client.query(mailQuery,values,(err,res)=>{ 
                var mailOptions = {
                from: 'kunaldubey2297@gmail.com',
                to: res.rows[0].email,
                subject: 'Your VRIT OTP',
                text: `OTP for Signin into your VRIT application is ${getOtp(req.body.rollnumber)}`
                };
                transporter.sendMail(mailOptions, function(error, info){
                    if (error) {
                    console.log(error); 
                    resp.status(500);
                    } else {
                    console.log('Email sent: ' + info.response);
                    }
                }); 
                resp.send("OK").status(200);
        
    })  
}) 
router.post('/check', function(req, resp, next) {     
    redisClient.get('rollNum',(err,data)=>{ 
        if(err) throw err;  
        if(data!=null){ 
            console.log("Roll number is "+data);  
            console.log("otp is "+req.body.otp);   
            const otpEntered = req.body.otp;  
            console.log("Otp is "+otpEntered);  
            console.log("roll number "+data); 
            var values = [data]
            const otpQuery = 'SELECT otp FROM users WHERE rollnumber = $1'  
            client.query(otpQuery,values,(err,res)=>{ 
                if(err){ 
                    console.log(err.stack);
                } else {  
                        otpPresent = res.rows[0].otp;
                        if(otpEntered==otpPresent){  
                            users.updateOne({rollnumber:data.toUpperCase()}, {registered:true},(err,res)=>{ 
                                if(res.nModified==1)console.log("User registered"); 
                                else console.log("User already registered")
                                resp.status(200).send('Welcome');
                            })
                        }else{ 
                            resp.status(200).send('Invalid Otp');
                        }
                }
            })  

        }
    })
    //
});  

router.get('/',function(req,res){ 
    res.send(req.body.username + req.body.password);  
})  

router.get('/test',function(req,res){ 
    res.send("Positive");
})

module.exports = router;