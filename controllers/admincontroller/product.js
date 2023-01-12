const { response } = require('../../app');
const adminProductHelpers= require('../../helpers/adminHelpers/adminProductHelpers');
const { category } = require('../../models/connection');
const user = require("../../models/connection");


module.exports={
    //get add product


getAddProduct: (req, res) =>{
    let admins=req.session.admin
    adminProductHelpers.getAddProduct().then((response)=>{
    res.render("admin/add-product", { layout: "adminLayout",response,admins});
    })
  
  },
  //post add product
  
   
  postAddProduct: (req, res) =>{
    adminProductHelpers.postAddProduct(req.body,req.file.filename).then((response)=>{
     res.redirect('/admin/view_product')
    })
   
  },
  
  //getview product
  
   
  getViewproduct:(req,res) =>{
    let admins=req.session.admin
    adminProductHelpers.getViewProduct().then((response)=>{
      res.render("admin/view-product", { layout: "adminLayout" ,response,admins});
    })
    
  },
  
  
  //edit view product
  
  editViewProduct:(req,res) =>{
    let admins=req.session.admin
    adminProductHelpers.viewAddCategory().then((response)=>{
  
      var procategory=response
      adminProductHelpers.  editProduct(req.params.id).then((response)=>{
        editproduct=response
       
      res.render('admin/edit-viewproduct',{ layout: "adminLayout" ,editproduct,procategory,admins});
  
    })})
    
    
  
  },
  
  //posteditaddproduct
  
  
  postEditAddProduct:(req,res) =>{
    adminProductHelpers.postEditProduct(req.params.id,req.body,req?.file?.filename).then((response)=>{
     
      res.redirect('/admin/view_product')
    })
  
    
  },
  
  
  //delete view product 
  
  
  deleteViewProduct:(req,res) =>{
    
    adminProductHelpers.deleteViewProduct(req.params.id).then((response)=>{
      res.redirect('/admin/view_product')
    })
  
  },

  getOrderList:(req, res)=>
  {
    adminProductHelpers.getOrder(req.params.id).then((response)=>
    {
      res.render('admin/user-order',{ layout: "adminLayout" ,response})
    })
  }
     

  }
