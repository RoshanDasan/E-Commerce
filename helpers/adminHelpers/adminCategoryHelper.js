const user = require("../../models/connection");
const multer = require("multer");
const { response } = require("../../app");

module.exports = {
  //add category

  addCategory: (data) => {
    return new Promise(async (resolve, reject) => {
      const categoryData = new user.category({
        CategoryName: data.categoryname,
      });

      await categoryData.save().then((data) => {
        resolve(data);
      });
    });
  },

  //view category

  viewAddCategory: () => {
    return new Promise(async (resolve, reject) => {
      await user.category
        .find()
        .exec()
        .then((response) => {
          resolve(response);
        });
    });
  },
  // delete category

  deleteCatogory: (CategoryId) => {
    return new Promise(async (resolve, reject) => {
      await user.category.deleteOne({ _id: CategoryId }).then((data) => {
        resolve(data);
      });
    });
  },

  // edit categoty

  editCategory: (editCategoryId) => {
    return new Promise(async (resolve, reject) => {
      await user.category
        .find({ _id: editCategoryId })
        .exec()
        .then((response) => {
          resolve(response[0]);
        });
    });
  },
  //post edit ctaegory

  postEditCategory: (editedId, editedName) => {
    return new Promise(async (resolve, reject) => {
      await user.category
        .updateOne({ _id: editedId }, { $set: { CategoryName: editedName } })
        .then((response) => {
          resolve(response);
        });
    });
  },
};
