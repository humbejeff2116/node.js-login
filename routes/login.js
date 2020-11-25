


















module.exports = function login(req,res){
    if(req.query.search){
        return res.render('signup')
    }
   return res.render('login' ,{title:'login'})
   
}