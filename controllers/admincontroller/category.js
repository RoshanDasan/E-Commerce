const adminCategoryHelper = require("../../helpers/adminHelpers/adminCategoryHelper");

module.exports = {
  //get method category
  getCategory: (req, res) => {
    let admins = req.session.admin;
    adminCategoryHelper.viewAddCategory().then((response) => {
      var viewCategory = response;
      res.render("admin/add-category", {
        layout: "adminLayout",
        viewCategory,
        admins,
      });
    });
  },
  //post method category

  postCategory: (req, res) => {
    adminCategoryHelper.addCategory(req.body).then((data) => {
      res.redirect("/admin/add_category");
    });
  },
  //deletecategory

  deleteCategory: (req, res) => {
    adminCategoryHelper.deleteCatogory(req.params.id).then((response) => {
      res.redirect("/admin/add_category");
    });
  },
  //getedit category

  editCategory: (req, res) => {
    let admins = req.session.admin;
    adminCategoryHelper.editCategory(req.params.id).then((response) => {
      res.render("admin/edit_category", {
        layout: "adminLayout",
        response,
        admins,
      });
    });
  },
  //postedit category

  postEditCategory: (req, res) => {
    adminCategoryHelper
      .postEditCategory(req.params.id, req.body.editCategoryname)
      .then((response) => {
        res.redirect("/admin/add_category");
      });
  },
};
