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
        editproduct = response;
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
    const images = [];
    if (req.files.length != 0) {
      Object.keys(req?.files).forEach((key) => {
        if (Array.isArray(req.files[key])) {
          req?.files[key]?.forEach((file) => {
            images.push(file.filename);
          });
        } else {
          images.push(req?.files[key]?.filename);
        }
      });
    }else
    {
      images.push(req.session.admin.images)
      req.session.admin.images = null

    }


    adminProductHelpers
      .postEditProduct(req.params.id, req.body, images)
      .then((response) => {
        res.redirect("/admin/view_product");
      });
  },

  //delete view product

  deleteViewProduct: (req, res) => {
    adminProductHelpers.deleteViewProduct(req.params.id).then((response) => {
      res.redirect("/admin/view_product");
    });
  },

  // order
  getOrderList: (req, res) => {
    let admins = req.session.admin;

    orderHelper.getOrder(req.params.id).then((response) => {
      res.render("admin/user-order", { layout: "adminLayout", admins });
    });
  },

  // for edit the status of order
  getEditOrderStatus: (req, res) => {
    orderHelper.editOrderStatus(req.body).then((response) => {
      res.json(response);
    });
  },
};
