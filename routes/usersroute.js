





var express = require('express');
var passport = require('passport');
var User = require('../models/user');
var multer = require('multer');
var upload = multer({dest :'public/uploads'});
const {body, check, validationResult } = require('express-validator');
// var setupPassport = require('../setuppassport');
// setupPassport();
const login = require('./login')


var router = express.Router();


router.get('/',ensureAuthenticated ,(req,res,next)=>{
    let username = req.body.username;
    User.find()
    .sort({createdAt: 'descending'})
    .exec(function(err, users){
        if(err){
            return next(err);
        }
        res.render('index',{users:users, title:'members'})

    })
})


function ensureAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        return next();

    }
    req.flash('info' , 'you must be logged in to see this page')
    return res.redirect('/users/login')
}



// sign up roter
router.get('/signup', (req,res)=>{
    res.render('signup',{title:'signup'})
  
});

const validation =[
    check('name').notEmpty().withMessage('Name field is required'),
    check('username').notEmpty().withMessage('username field is required'),
    check('bio').notEmpty().withMessage('bio field is required'),
    check('password' ).notEmpty().withMessage('password field is required')
    .custom((value,{req})=>{
        if(value !== req.body.password2){
          throw new Error('password confirmation is incorrect')
        } 
        return value;
    }),
    check('password').isLength({ min: 5 }).withMessage(' password should contain more than 4 characters'),
    // body('password2').isLength({ min: 5 }).withMessage(' password should be more than 5 chars')
]




   
router.post('/signup',upload.single('profileimage'),validation, (req, res,next) => {

    const errors = validationResult(req);
    // console.log(req.body)
      if (!errors.isEmpty()) {
        return res.status(422).render('signup', { valErrors: errors.array(),title:'signup'});
      }

    var name = req.body.name ;
    var username = req.body.username;
    var password = req.body.password;
    var bio = req.body.bio;
    var profileimage = (req.file) ? req.file.filename: 'noimage.jpg';
    console.log(req.file);

  
        User.findOne({username:username} , function(err,user){
            if(err){
                return next(err)
            }

            if(user){
                req.flash('error' , 'username has already been taken');
                res.location('/users/signup')
                return res.redirect('/users/signup');
            }

            let newUser = new User ({
                name:name,
                username:username,              
                bio:bio,
                password:password,
                profileimage:profileimage
            });
         
            newUser.save(next);
            req.flash('info' , 'you are now registered')
            console.log(newUser)
            
          
        });


   
 
},passport.authenticate('local' , {
    successRedirect: '/users/',
    failureRedirect:'/users/signup',
    failureFlash: true

}));










// login router
router.post('/login' , passport.authenticate('local' ,{
    // successRedirect :'/users/',
    failureRedirect: '/users/login',
    failureFlash: true,
    // failureFlash: 'invalid username or password'
}),(req,res)=>{
    req.flash('info', 'you are now logged in')
    res.redirect('/users/');
});


router.get('/login' , login);


    // logout router
    router.get('/logout', (req,res)=>{
        req.logout();
      
        req.flash('info'  , 'you are now loged out');
        res.redirect('/users/login');
    });



//  the profile route

router.get('/:username' , (req, res,next)=>{
  
    User.findOne({username:req.params.username}, function(err,user){
        if(err){
           return next(err);
        }
        if(!user){
            return next();
        }
        res.render('profile' ,{user:user});
  
    })
});


router.get('/edit',ensureAuthenticated, (req,res)=>{
    res.render('edit');
 
});

router.post('/edit',ensureAuthenticated, (req,res,next)=>{
    req.user.name = req.body.name;
    req.user.username = req.body.username;
    req.user.bio = req.body.bio;
    req.user.save(function(err){
        if(err){
            return next(err);
         
        }
        req.flash('info' ,  'profile updated!')
        res.redirect('users/edit')
    })
})



module.exports = router;


    
    
