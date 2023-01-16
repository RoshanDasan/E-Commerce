const { response } = require('../../app');
const adminHelper= require('../../helpers/adminHelpers/adminProductHelpers');
const coupenHelper = require('../../helpers/adminHelpers/adminCouponHelpers')
const { category } = require('../../models/connection');
const user = require("../../models/connection");



let admins

const adminCredential={
    name:'superAdmin',
    email:'admin@gmail.com',
    password:'admin123'
   }
  
module.exports={

 // get login

     getAdminLogin:(req, res)=> {
       admins=req.session.admin
        if(req.session.adminloggedIn){
          res.render("admin/admin-dashboard",{layout:"adminLayout",admins})
        }else{
       
         res.render('admin/login',{layout:'adminLayout'})
        }
        
      },


  postAdminLogin:(req, res)=> {
        
        if(req.body.email==adminCredential.email && req.body.password==adminCredential.password){
          
        req.session.adminloggedIn=true

        let adminstatus=req.session.adminloggedIn
        
        req.session.admin=adminCredential
       
        res.redirect('/admin')
      }
      
        else{
          // adminloginErr=true
        
        res.render('admin/login',{layout:'adminLayout',adminloginErr:true, admins,invalid:true})
        }
       },
       
//get dashboard

  getDashboard: (req, res) =>{
    
 
  admins=req.session.admin
 
    
    res.render("admin/admin-dashboard",{ layout: "adminLayout" ,admins});
    },

    getAllOrderds:(req, res)=>
  {
    admins=req.session.admin

    adminHelper.getAllOrders().then((response)=>
     {
      let len = response.length
      
      let order = response.slice().reverse()

      console.log(order,'----order')  
      console.log(len);

      res.render('admin/all-orders', { layout: "adminLayout" ,response, admins})

     })
    
  },

  

//admin logout

getAdminLogOut:(req,res)=>{
  req.session.adminloggedIn=false
  admins=req.session.adminloggedIn

  res.render("admin/login",{layout: "adminLayout",admins})
},




}



