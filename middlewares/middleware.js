
const DB = require('../models/connection');

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
      
      userBlockBug:(async(req,res,next)=>{
        let userId =req.session.user.id
        let user=  await DB.user.findOne({_id:userId})
        console.log(user);
        if(!user.blocked){
        console.log('hi');
          next()
          
        }else{
          console.log('hlo');

          res.redirect('/logout')
        }
       
      }),
    
  }