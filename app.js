




const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const messages =require('express-messages')
const flash = require('connect-flash');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const usersRoute = require('./routes/usersroute');
const passport = require('passport');
const mongoose = require('mongoose');
const setUpPassport = require('./setuppassport')
const {body, check, validationResult } = require('express-validator');
const app = express();

const mongoDB = 'mongodb://localhost/test';
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true  },(err,conn)=>{
    if (err) {
        throw err;
    }
    console.log(`connection succesful ${conn}`); 
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connectionnnn error:'));
setUpPassport();
app.set('port' , process.env.PORT || 4000);
app.set('views' , __dirname +'/views');
app.set ('view engine' , 'ejs');
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false, }));
app.use(cookieParser());
app.use( session({
    secret:'secret',
    saveUninitialized:true,
    resave:true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use((req, res, next) => {
    res.locals.messages = messages();
    next();
});

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
app.listen(app.get('port') , ()=>{
    console.log('app started on port' + app.get('port'))
});