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

  getDashboard:async (req, res) =>{
    
 
  admins=req.session.admin
  let totalProducts, days=[]
  let ordersPerDay = {}; 


  await adminHelper.getAllProducts().then((Products)=>
  {
    totalProducts = Products.length
  })

 await adminHelper.getOrderByDate().then((response)=>
  {
    let result = response[0].orders
    for (let i = 0; i < result.length; i++) {
      let ans={}
      ans['createdAt']=result[i].createdAt
      days.push(ans)
      ans={}
      
    }
    console.log(days);


days.forEach((order) => {
  const day = order.createdAt.toLocaleDateString('en-US', { weekday: 'long' });
  ordersPerDay[day] = (ordersPerDay[day] || 0) + 1; 

});
console.log(ordersPerDay);

  })


 await adminHelper.getAllOrders().then((response)=>
  {

    var length = response.length
    
    let total = 0;
    
    for (let i = 0; i < length; i++) {
      total += response[i].orders.totalPrice;
    }
    res.render("admin/admin-dashboard",{ layout: "adminLayout" ,admins, length, total, totalProducts,ordersPerDay});

  }) 
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



