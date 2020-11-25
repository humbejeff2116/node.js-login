




const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const messages =require('express-messages')
const flash = require('connect-flash');
var bcrypt = require('bcryptjs');
var morgan = require('morgan');
var bodyParser = require('body-parser');
// var routes = require('./routes/indexroute');
var usersRoute = require('./routes/usersroute');
var multer = require('multer');
var upload = multer({destination:'../public/uploads'});
var passport = require('passport');
var mongoose = require('mongoose');
var mongodb = require('mongodb');
var setUpPassport = require('./setuppassport')
const {body, check, validationResult } = require('express-validator');
// var mongo = require('mongodb') ;

//Import the mongoose module


// instantiating the express app
var app = express();
// create a db connection


//Set up default mongoose connection
var mongoDB = 'mongodb://localhost/test';
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true  },(err,conn)=>{
    if(err){
        throw err;
    }
    console.log(`connection succesful ${conn}`);
   
});

//Get the default connection
var db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connectionnnn error:'));

setUpPassport();



// set view engine
app.set('port' , process.env.PORT || 4000);
app.set('views' , __dirname +'/views');
app.set ('view engine' , 'ejs');


app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false, }));
app.use(cookieParser());




// handle sessions
app.use( session({
    secret:'secret',
    saveUninitialized:true,
    resave:true
}));
// passport
app.use(passport.initialize());
app.use(passport.session());

// messages
app.use(flash());
app.use((req,res,next)=>{
    res.locals.messages = messages();
    next();
});

// handle validations
// check it out on the site not sure if it is completely correct

// set your routes




app.use('*', ( req,res,next )=>{
    res.locals.currentUser = req.user;
    res.locals.errors = req.flash('error');
    res.locals.infos = req.flash('info')
    res.locals.valErrors = validationResult(req).array()
    next();
});
app.use('/users', express.static(__dirname +'/public'));

app.use('/users' ,usersRoute );

app.use((req,res)=>{
    res.status(404).render('404',{title:'error'});
});

// start your server
app.listen(app.get('port') , ()=>{
    console.log('app started on port' + app.get('port'))
});





