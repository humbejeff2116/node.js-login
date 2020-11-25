





var mongoose = require('mongoose');
var bcrypt = require('bcryptjs')







var userSchema = mongoose.Schema({
    name:{type: String , required:true},
    username:{type: String, required: true, unique: true},
    password:{type: String , required: true, },
    createdate:{ type:Date , default: Date.now},
    displayname:{type: String},
    bio:{type: String},
    profileimage:{type: String}
});



userSchema.pre('save' , function (next){
    let user = this;
  
    if(!user.isModified("password")){
        return next();

    }
    bcrypt.genSalt(10, function(err,salt){
        if(err){

            return next(err);
            
        }
      
        bcrypt.hash(user.password, salt,function(err, hashedpassword){
                if(err){
                    return next(err);

                }
                user.password = hashedpassword;
                next();
            });
    });
});

userSchema.methods.checkPassword = function(guess,done){
    bcrypt.compare(guess, this.password, function(err,isMatch){
        done(err, isMatch);
    });

};




userSchema.methods.displayName = function(){
    return this.displayname || this.username
} 

const User  = mongoose.model('User' , userSchema)
module.exports = User;
