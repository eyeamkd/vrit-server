var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
const session = require('express-session');  
const redis = require('redis');
const redisClient = redis.createClient();
const redisStore = require('connect-redis')(session);  
const mongoose = require('mongoose');
const MONGO_DATABASE = 'mongodb://localhost:27017/vritDB';
const { Expo } = require('expo-server-sdk'); 
//-------------------------Routers-----------------------------//
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users'); 
var signinRouter = require('./routes/signin'); 
var otpRouter = require('./routes/otp');  
var pollsRouter = require('./routes/polls');
var notificationsRouter = require('./routes/notifications');

const app = express()  
mongoose.connect(MONGO_DATABASE,{   
  useCreateIndex:true,
  useNewUrlParser:true,
  useFindAndModify:true
}).then(connectionObject=>{ 
  console.log("MONGO DB Connected"); 
  //console.log(connectionObject.connections); 
}).catch(err=>{ 
  console.log(err);
});
let savedPushTokens = [];


redisClient.on('error', (err) => {
  console.log('Redis error: ', err);
}); 

redisClient.on('connect',function(){ 
  console.log("Connected!!");
})

app.use(session({
  secret: 'ThisIsHowYouUseRedisSessionStorage',
  name: '_redisPractice',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }, 
  store: new redisStore({ host: 'localhost', port: 6379, client: redisClient, ttl: 86400 }),
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', indexRouter);
app.use('/users', usersRouter); 
app.use('/signin',signinRouter);  
app.use('/notifications',notificationsRouter); 
app.use('/otp',otpRouter); 
app.use('/polls',pollsRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
}); 


module.exports = app;
