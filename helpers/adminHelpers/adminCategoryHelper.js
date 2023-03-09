const user = require("../../models/connection");

module.exports = {
  //add category

  addCategory: (data) => {
    return new Promise(async (resolve, reject) => {


      let cat = await user.category.findOne({ CategoryName: data.categoryname });

      if(!cat)
      {
        let category = user.category({
          CategoryName: data.categoryname,
          subCategory: data.subCategoryname,
        })

        await category.save().then((result)=>
        {
          resolve(result)

        })
      }
         
      else{
        let category = await user.category.updateOne({CategoryName: data.categoryname},
          {$push:{subCategory: data.subCategoryname}}).then((response)=>
          {
            resolve(response);

          })

      }

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
