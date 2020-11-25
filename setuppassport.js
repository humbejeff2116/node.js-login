



var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/user');




module.exports = function(){
    passport.serializeUser(function(user, done) {
        done(null, user.id);
      });
      
      passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
          done(err, user);
        });
      });


 
    passport.use(new LocalStrategy(
      function(username, password, done) {




        User.findOne({ username: username }, function (err, user) {

        if (err) { return done(err); }
        if (!user) {
          return done(null, false, { message: 'Incorrect username.' });
        }

        user.checkPassword(password,function(err,isMatch) {
            if(err){
                return done(err);
            }
            if(!isMatch){
                return done(null, false, { message: 'Incorrect password.' });

            }
            return done(null, user);
        
        });
   
  
      });
  }));

}


// User.findOne({username:username})
// .then(user=>{
//     if(!user){
//         return done(null, false,{message:' no user has that name'})
//     } 
//        return user
//     
// })
// .then(user=>{
//   user.checkPassword(password)
// })
// .then(isMatch=>{
//     if(isMatch){
//         return done(null,user)
//     }else{
//         return done(null,false,{message:'invalid password'})
//     }
// })
// .catch(err=>{
//     return done(error)
// })
