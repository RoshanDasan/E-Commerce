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
    console.log(req.body);
    console.log(req.files);
  
    let image = req.files.map(files => (files.filename))
    // let image = req.file.filename
    console.log(image);
    adminProductHelpers.postAddProduct(req.body, image).then((response)=>{
      console.log(response);
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
      adminProductHelpers.editProduct(req.params.id).then((response)=>{
        editproduct=response
        req.session.admin.images = response.Image

       
      res.render('admin/edit-viewproduct',{ layout: "adminLayout" ,editproduct,procategory,admins});
  
    })})
    
    
  
  },
  
  //posteditaddproduct
  
  
  postEditAddProduct:(req,res) =>{
    console.log(req.session.admin.images);
    console.log(req.files);
    adminProductHelpers.postEditProduct(req.params.id, req.body, req.files).then((response)=>{
     
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
    let admins=req.session.admin

    adminProductHelpers.getOrder(req.params.id).then((response)=>
    {
      res.render('admin/user-order',{ layout:"adminLayout", admins})
    })
  },

  getEditOrderStatus:(req,res)=>

  {
    adminProductHelpers.editOrderStatus(req.body).then((response)=>
    {
      res.json(response)
    })


  }

  
     

  }
