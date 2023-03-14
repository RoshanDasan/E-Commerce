const { json } = require("express");
const { response } = require("../../app");
const adminProductHelpers = require("../../helpers/adminHelpers/adminProductHelpers");
const orderHelper = require("../../helpers/adminHelpers/orderHelper");

module.exports = {
  //get add product

  getAddProduct: (req, res) => {
    let admins = req.session.admin;
    adminProductHelpers.getAddProduct().then((response) => {
      res.render("admin/add-product", {
        layout: "adminLayout",
        response,
        admins,
      });
    });
  },
  //post add product

  postAddProduct: (req, res) => {
    let image = req.files.map((files) => files.filename);
    adminProductHelpers.postAddProduct(req.body, image).then((response) => {
      res.redirect("/admin/view_product");
    });
  },

  //getview product

  getViewproduct: (req, res) => {
    let admins = req.session.admin;
    adminProductHelpers.getViewProduct().then((response) => {
      res.render("admin/view-product", {
        layout: "adminLayout",
        response,
        admins,
      });
    });
  },

  //edit view product

  editViewProduct: (req, res) => {
    let admins = req.session.admin;
    adminProductHelpers.viewAddCategory().then((response) => {
      var procategory = response;
      adminProductHelpers.editProduct(req.params.id).then((response) => {
        let editproduct = response;
        req.session.admin.images = response.Image;

        res.render("admin/edit-viewproduct", {
          layout: "adminLayout",
          editproduct,
          procategory,
          admins,
        });
      });
    });
  },

  //posteditaddproduct

  postEditAddProduct: (req, res) => {
  

    let images = [];



    if (!req.files.image1) {
    
      images.push(req.body.image1)
    } else {
      images.push(req.files.image1[0].originalname)

    }
    if (!req.files.image2) {
      images.push(req.body.image2)

    } else {
      images.push(req.files.image2[0].originalname)


    }
    if (!req.files.image3) {
      images.push(req.body.image3)

    } else {
      images.push(req.files.image3[0].originalname)

    }
    if (!req.files.image4) {
      images.push(req.body.image4)

    } else {
      images.push(req.files.image4[0].originalname)

    }

      console.log(images);

        adminProductHelpers
      .postEditProduct(req.params.id, req.body, images)
      .then((response) => {
        res.redirect("/admin/view_product");
      });

  },

  // list and unlist product

  UnlistProduct:async (req, res)=>
  {
    let condition = JSON.parse(req.body.condition)
    let proId = req.body.proId
    await adminProductHelpers.unlistProduct(proId, condition).then((response)=>
    {
      res.json(true)
    })
  },


  //delete view product

  deleteViewProduct: (req, res) => {
    adminProductHelpers.deleteViewProduct(req.params.id).then((response) => {
      res.redirect("/admin/view_product");
    });
  },


  // for edit the status of order
  getEditOrderStatus: (req, res) => {
    orderHelper.editOrderStatus(req.body).then((response) => {
      res.json(response);
    });
  },
};
