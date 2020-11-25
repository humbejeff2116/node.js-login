




var express = require('express');

var User = require('../models/user');


var router = express.Router();



router.get('/',ensureAuthenticated ,(req,res,next)=>{
    User.find()
    .sort({createdAt: 'descending'})
    .exec(function(err, users){
        if(err){
            return next(err);
        }
        res.render('index',{users:users,title:members})

    })

})


function ensureAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        return next();

    }
    return res.redirect('/users/login')
}

module.exports = router;
