const user = require("../../models/connection");
const ObjectId = require("mongodb").ObjectId;


module.exports = {
  // adding to wishlist

  addToWishlist: async (proId, userId) => {
    let proObj = {
      productId: proId,
    };

    return new Promise(async (resolve, reject) => {
      let wishlist = await user.wishlist.findOne({ user: userId });
      if (wishlist) {
        let productExist = wishlist.wishlistItems.findIndex(
          (item) => item.productId == proId
        );
        if (productExist == -1) {
          user.wishlist
            .updateOne(
              { user: userId },
              {
                $addToSet: {
                  wishlistItems: proObj,
                },
              }
            )
            .then(() => {
              resolve();
            });
        }
      } else {
        const newWishlist = new user.wishlist({
          user: userId,
          wishlistItems: proObj,
        });

        await newWishlist.save().then((data) => {
          resolve(data);
        });
      }
    });
  },

  // view wishlist

  viewWishlist: (userId) => {
    return new Promise(async (resolve, reject) => {
      await user.wishlist
        .aggregate([
          {
            $match: {
              user: ObjectId(userId),
            },
          },
          {
            $unwind: "$wishlistItems",
          },

          {
            $project: {
              item: "$wishlistItems.productId",
            },
          },

          {
            $lookup: {
              from: "products",
              localField: "item",
              foreignField: "_id",
              as: "wish",
            },
          },
          {
            $project: {
              item: 1,
              wishlistItems: { $arrayElemAt: ["$wish", 0] },
            },
          },
        ])
        .then((wishlistItems) => {
          resolve(wishlistItems);
        });
    });
  },

  // delete wishlist
  deleteWishlist: (data) => {
    return new Promise((resolve, reject) => {
      user.wishlist
        .updateOne(
          { _id: data.wishlistId },
          { $pull: { wishlistItems: { productId: data.productId } } }
        )
        .then((response) => {
          resolve({ removeProduct: true });
        });
    });
  },

  // getting wishlist count

  getWishCount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let count = 0;
      let wishlist = await user.wishlist.findOne({ user: userId });
      if (wishlist) {
        count = wishlist.wishlistItems.length;
      }
      resolve(count);
    });
  },

  // add to cart

  addToCartItem: (proId, userId, count) => {
    let proObj = {
      productId: proId,
      Quantity: 1,
    };
    return new Promise(async (resolve, reject) => {
      let carts = await user.cart.findOne({ user: userId });
      if (carts) {
        let productExist = carts.cartItems.findIndex((cartItems) => cartItems.productId == proId);

        if (productExist != -1) {
          user.cart
            .updateOne(
              { user: userId, "cartItems.productId": proId },
              {
                $inc: { "cartItems.$.Quantity": 1 },
              }
            )
            .then((response) => {
              resolve({ response, status: false });
            });
        } else {
          await user.cart
            .updateOne(
              { user: userId },
              {
                $push: {
                  cartItems: proObj,
                },
              }
            )
            .then((response) => {
              resolve({ count, status: true });
            });
        }
      } else {
        let cartItems = new user.cart({
          user: userId,
          cartItems: proObj,
        });
        await cartItems.save().then(() => {
          resolve({ status: true });
        });
      }
    });
  },

  // list cart

  listAddToCart: (userId) => {
    return new Promise(async (resolve, reject) => {
      await user.cart
        .aggregate([
          {
            $match: {
              user: ObjectId(userId),
            },
          },
          {
            $unwind: "$cartItems",
          },

          {
            $project: {
              item: "$cartItems.productId",
              quantity: "$cartItems.Quantity",
            },
          },

          {
            $lookup: {
              from: "products",
              localField: "item",
              foreignField: "_id",
              as: "carted",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              carted: { $arrayElemAt: ["$carted", 0] },
            },
          },
        ])
        .then((cartItems) => {
          resolve(cartItems);
        });
    });
  },

  //get cart count

  getCartCount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let count = 0;
      let cart = await user.cart.findOne({ user: userId });
      if (cart) {
        count = cart.cartItems.length;
      }
      resolve(count);
    });
  },

  // delete cart
  deleteCart: (data) => {
    return new Promise((resolve, reject) => {
      user.cart
        .updateOne(
          { _id: data.cartId },
          { $pull: { cartItems: { productId: data.product } } }
        )
        .then(() => {
          resolve({ removeProduct: true });
        });
    });
  },
};
