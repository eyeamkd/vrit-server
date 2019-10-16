var express = require('express');
var router = express.Router();   
const session = require('express-session');
var nodemailer = require('nodemailer');
const assert = require('assert');   
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
    var values = [req.body.username];   
    var rollnumber = req.body.username;   
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
        if(err){ 
            console.log(err.stack); 
            resp.status(500);
        } else {  
                var mailOptions = {
                from: 'kunaldubey2297@gmail.com',
                to: res.rows[0].email,
                subject: 'Your VRIT OTP',
                text: `OTP for Signin into your VRIT application is ${getOtp(req.body.username)}`
                };
                transporter.sendMail(mailOptions, function(error, info){
                    if (error) {
                    console.log(error);
                    } else {
                    console.log('Email sent: ' + info.response);
                    }
                }); 
                resp.status(200);
        }
    })  
}) 
router.post('/check', function(req, resp, next) {     
    let rollnumber = '';
    // redisClient.exists('rollNum', function(err, reply) {
    //     if (reply === 1) {
    //         console.log('exists'); 
    //         resp.send('Roll num is there').status(200);
    //     } else {
    //         console.log('doesn\'t exist'); 
    //         resp.send('Roll num is  not there').status(200);
    //     }
    // });  
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
                            resp.status(200).send('Welcome');
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