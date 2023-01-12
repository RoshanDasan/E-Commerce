const { response } = require('../../app');
const adminUserHelper= require('../../helpers/adminHelpers/adminUserhelper');
const { category } = require('../../models/connection');
const user = require("../../models/connection");


module.exports={
    
// get user view

getViewUser: (req, res)=>{
    let admins=req.session.admin
 adminUserHelper.getUsers().then((user)=>{
      res.render("admin/view-users", { layout: "adminLayout",user,admins});
  
    })
  },
  //block user 
  
  getBlockUser: (req, res)=> {
   
 adminUserHelper.blockUser(req.params.id).then((response)=>{
  
      res.redirect('/admin/view_users')
    })
  },
  // unblock user
  
  getUnBlockUser: (req, res)=>{
  
 adminUserHelper.UnblockUser(req.params.id).then((response)=>{
  
      res.redirect('/admin/view_users')
    })
  },
  
  
}