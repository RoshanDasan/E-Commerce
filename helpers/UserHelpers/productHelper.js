const user = require("../../models/connection");


module.exports = {
  // list product in shop page

  shopListProducts: (pageNum) => {
    let perPage = 6;
    return new Promise(async (resolve, reject) => {
      await user.product
        .find()
        .skip((pageNum - 1) * perPage)
        .limit(perPage)
        .then((response) => {
          resolve(response);
        });
    });
  },

  // find the count of orders

  getDocCount: () => {
    return new Promise(async (resolve, reject) => {
      await user.product
        .find()
        .countDocuments()
        .then((documents) => {
          resolve(documents);
        });
    });
  },

  // change the product quantity

  changeProductQuantity: (data) => {
    let count = parseInt(data.count);
    let quantity = parseInt(data.quantity);
    return new Promise((resolve, reject) => {
      if (count == -1 && quantity == 1) {
        user.cart
          .updateOne(
            { _id: data.cart },
            {
              $pull: { cartItems: { productId: data.product } },
            }
          )
          .then(() => {
            resolve({ removeProduct: true });
          });
      } else {
        user.cart
          .updateOne(
            { _id: data.cart, "cartItems.productId": data.product },
            {
              $inc: { "cartItems.$.Quantity": count },
            }
          )
          .then(() => {
            resolve({ status: true });
          });
      }
    });
  },
};
