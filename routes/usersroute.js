





var express = require('express');
var passport = require('passport');
var User = require('../models/user');
var multer = require('multer');
var upload = multer({dest :'public/uploads'});
const {body, check, validationResult } = require('express-validator');
const login = require('./login')
const router = express.Router();

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash('info' , 'you must be logged in to see this page')
    return res.redirect('/users/login')
}

const validation = [
    check('name').notEmpty().withMessage('Name field is required'),
    check('username').notEmpty().withMessage('username field is required'),
    check('bio').notEmpty().withMessage('bio field is required'),
    check('password' ).notEmpty().withMessage('password field is required')
    .custom((value, {req}) => {
        if (value !== req.body.password2) {
          throw new Error('password confirmation is incorrect')
        }
        if (value.length < 5){
            throw new Error('password should contain more than 4 characters')
        } 
        return value;
    })
]

router.get('/', ensureAuthenticated, (req, res, next) => {
    User.find()
    .sort({createdAt: 'descending'})
    .exec(function(err, users) {
        if (err) {
            return next(err);
        }
        res.render('index',{users:users, title:'members'})
    })
})
router.get('/signup', (req, res) => {
    res.render('signup',{title: 'signup'})
});
router.post('/signup', upload.single('profileimage'), validation, (req, res, next) => {
    const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).render('signup', { valErrors: errors.array(),title:'signup'});
      }
    const name = req.body.name;
    const username = req.body.username;
    const password = req.body.password;
    const bio = req.body.bio;
    const profileimage = (req.file) ? req.file.filename : 'noimage.jpg';
        User.findOne({ username: username } , function(err, user) {
            if (err) {
                return next(err)
            }
            if (user) {
                req.flash('error' , 'username has already been taken');
                res.location('/users/signup')
                return res.redirect('/users/signup');
            }
            let newUser = new User({
                name:name,
                username:username,              
                bio:bio,
                password:password,
                profileimage:profileimage
            });
            newUser.save(next);
            req.flash('info' , 'you are now registered')
        });
},passport.authenticate('local' , {
    successRedirect: '/users/',
    failureRedirect:'/users/signup',
    failureFlash: true
}));
router.post('/login' , passport.authenticate('local', {
    failureRedirect: '/users/login',
    failureFlash: true,
}), (req, res) => {
    req.flash('info', 'you are now logged in')
    res.redirect('/users/');
});
router.get('/login', login);
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('info'  , 'you are now loged out');
    res.redirect('/users/login');
});
router.get('/:username' , (req, res, next) => {
    User.findOne({ username: req.params.username }, function(err, user) {
        if (err) {
           return next(err);
        }
        if (!user) {
            return next();
        }
        res.render('profile' ,{user:user});
    })
});
router.get('/edit', ensureAuthenticated, (req, res) => {
    res.render('edit');
});
router.post('/edit', ensureAuthenticated, (req, res, next) => {
    req.user.name = req.body.name;
    req.user.username = req.body.username;
    req.user.bio = req.body.bio;
    req.user.save(function(err) { 
        if (err) {
            return next(err); 
        }
        req.flash('info' ,  'profile updated!')
        res.redirect('users/edit')
    })
})
module.exports = router;