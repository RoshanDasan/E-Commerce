

  module.exports={
    auth:(function(req,res,next){
        if(req.session.adminloggedIn){
          next()
        }else{
          res.render('admin/login',{layout:'adminlayout'})
        }
       
      }),
      userauth:(function(req,res,next){
        if(req.session.loggedIn){
          next()
        }else{
          res.render('user/login')
        }
       
      }),
      userlandingauth:(function(req,res,next){
        if(req.session.loggedIn){
          next()
        }else{
          res.render('user/user')
        }
       
      }),
    
  }