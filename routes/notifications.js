var express = require('express'); 
var router = express.Router(); 
var { Expo } = require('expo-server-sdk');

var expo = new Expo();
var savedPushTokens = [];  
function savedToken(token){  
    if(savedPushTokens.indexOf(token === -1)){ 
        savedPushTokens.push(token);
    }
}  
function justTocheck(){ 
    
}
function handlePushTokens(){ 
    var notifications = [];  
    var message = 'Helllo';
    for(var pushToken of savedPushTokens){ 
        if(!Expo.isExpoPushToken(pushToken)){ 
            console.error(`Push token ${pushToken} is not a valid Expo push token`); 
            continue;
        } 
        notifications.push({ 
            to:pushToken,
            sound:'default',
            title:'Message Received',
            body:message, 
            data:{messageData:message}
        })
    } 
    var chunks = expo.chunkPushNotifications(notifications);  
    var tickets = [];
    (async ()=>{  
        for(var chunk of chunks){ 
            try{  
                var ticketChunk = await expo.sendPushNotificationsAsync(chunk); 
                console.log(ticketChunk); 
                tickets.push(...ticketChunk);
            }catch(err){ 
                console.error(err);
            }
        }
    })();
}  
router.post('/token',(req,res)=>{  
    try{  
        savedToken(req.body.token.value); 
        console.log(`Received push token,${req.body.token.value}`);  
        //handlePushTokens();
        res.send(`Received push token, ${req.body.token.value}`); 
    }catch(err){ 
        console.error(err); 
        res.send('error occur').status(500);
    }
}); 
router.post('/message',(req,res)=>{ 
    handlePushTokens(req.body.message); 
    console.log(`Received message, ${req.body.message}`); 
    res.send(`Received message, ${req.body.message}`);
}); 
router.get('/',(req,res)=>{ 
    try{ 
        res.send("In Notifications").status(200);
    } 
    catch(err){
        console.log(err);
    }
    
}) 

module.exports = router;