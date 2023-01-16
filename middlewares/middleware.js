

  module.exports={
    auth:(function(req,res,next){
      
        if(req.session.admin){
          next()
        }else{

          res.render('admin/login',{layout:'adminLayout',admins:false})
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