const user = require("../../models/connection");
const bcrypt = require("bcrypt");
const { response } = require("../../app");
const ObjectId = require("mongodb").ObjectId;

module.exports = {
  //sign up
  doSignUp: (userData) => {
    let response = {};
    return new Promise(async (resolve, reject) => {
      try {
        email = userData.email;
        existingUser = await user.user.findOne({ email });
        if (existingUser) {
          response = { status: false };
          return resolve(response);
        } else {
          var hashedPassword = await bcrypt.hash(userData.password, 10);
          const data = new user.user({
            username: userData.username,
            Password: hashedPassword,
            email: userData.email,
            phonenumber: userData.phonenumber,
          });

          await data.save(data).then((data) => {
            resolve({ data, status: true });
          });
        }
      } catch (err) {
        console.log(err);
      }
    });
  },

  //login

  doLogin: (userData) => {
    return new Promise(async (resolve, reject) => {
      try {
        let response = {};
        let users = await user.user.findOne({ email: userData.email });
        if (users) {
          if (users.blocked == false) {
            await bcrypt
              .compare(userData.password, users.Password)
              .then((status) => {
                if (status) {
                  userName = users.username;
                  id = users._id;
                  // response.status
                  resolve({ response, loggedinstatus: true, userName, id });
                } else {
                  resolve({ loggedinstatus: false });
                }
              });
          } else {
            resolve({ blockedStatus: true });
          }
        } else {
          resolve({ loggedinstatus: false });
        }
      } catch (err) {
        console.log(err);
      }
    });
  },

  doUpdatePassword: (body) => {
    console.log(body);
    return new Promise(async (resolve, reject) => {
      let users = await user.user.findOne({ email: body.email });

      if (users) {
        let hashedPassword = await bcrypt.hash(body.password, 10);

        let change = await user.user
          .updateOne(
            { email: body.email },
            { $set: { Password: hashedPassword } }
          )
          .then((result) => {
            console.log(result);
            resolve({ update: true });
          });
      } else {
        resolve({ update: false });
      }
    });
  },


  //reset password


  verifyPassword:(userData,userId)=>{

    return new Promise(async(resolve, reject) => {

      let users=await user.user.findOne({_id:userId})
      await bcrypt
      .compare(userData.password, users.Password)
      .then(async (status) => {
        if(status){
          let hashedPassword = await bcrypt.hash(userData.password2, 10);
          await user.user.updateOne(
            {_id:userId},
            { $set:{
              Password:hashedPassword
            }}
            ).then((response)=>{
              resolve(response)
            })
        }else
        {
          resolve(false)
        }
      });
    })
  },

  //list product
  shopListProduct: () => {
    return new Promise(async (resolve, reject) => {
      await user.product
        .find()
        .exec()
        .then((response) => {
          resolve(response);
        });
    });
  },

  category: (categoryName) => {
    return new Promise(async (resolve, reject) => {
      await user.product.find({ category: categoryName }).then((response) => {
        resolve(response);
      });
    });
  },

  // banner

  getBannetData:()=>
  {
    return new Promise(async(resolve, reject) => {
      await user.banner.find().then((response)=>
      {
        console.log(response);
        resolve(response)
      })
    })
  },

  addToWishlist: async(proId, userId) => {
    
    const proObj = {
      productId: proId
    };

    return new Promise(async (resolve, reject) => {
      let wishlist = await user.wishlist.findOne({ user: userId });
      if (wishlist) {
        let productExist = wishlist.wishlistItems.findIndex(
          (item) => item.productId == proId
        );
         if(productExist==-1){
          user.wishlist
          .updateOne(
            { user: userId},
            {
              $addToSet:{
                wishlistItems:proObj
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
          wishlistItems:proObj
        });
      
        await newWishlist.save().then((data) => {
          resolve(data);
        });
      }
    });
  },

  getWishCount: (userId) => {
    console.log('api called');
    return new Promise(async (resolve, reject) => {
      let count = 0;
      let wishlist = await user.wishlist.findOne({ user: userId })
      if (wishlist) {
        count = wishlist.wishlistItems.length
      }
      resolve(count)

    })
  },
    
  viewWishlist: (userId) => {
    return new Promise(async (resolve, reject) => {
      const id = await user.wishlist
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

  deleteWishlist:(data)=>
  {

    return new Promise((resolve, reject) => {
      user.wishlist
        .updateOne(
          { _id: data.wishlistId},
          { $pull: { wishlistItems: { productId: data.productId } } }
        )
        .then((response) => {
          console.log(response);
          resolve({ removeProduct: true });
        });
    });
    
  },

  // add to cart

  addToCartItem: (proId, userId) => {
    proObj = {
      productId: proId,
      Quantity: 1,
    };
    return new Promise(async (resolve, reject) => {
      let carts = await user.cart.findOne({ user: userId });
      if (carts) {
        let productExist = carts.cartItems.findIndex(
          (cartItems) => cartItems.productId == proId
        );

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
              resolve({ response, status: true });
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
      const id = await user.cart
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

  // total checkout amount

  totalCheckOutAmount: (userId) => {
    return new Promise(async (resolve, reject) => {
      const id = await user.cart
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
              product: { $arrayElemAt: ["$carted", 0] },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: { $multiply: ["$quantity", "$product.Price"] } },
            },
          },
        ])
        .then((total) => {
          resolve(total[0]?.total);
        });
    });
  },

  subtotal: (userId) => {
    return new Promise(async (resolve, reject) => {
      const id = await user.cart
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

              price: {
                $arrayElemAt: ["$carted.Price", 0],
              },
            },
          },
          {
            $project: {
              total: { $multiply: ["$quantity", "$price"] },
            },
          },
        ])
        .then((total) => {
          resolve(total);
        });
    });
  },

  changeProductQuantity: (data) => {
    count = parseInt(data.count);
    quantity = parseInt(data.quantity);
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

  imageZoom: (requestedId) => {
    return new Promise(async (resolve, reject) => {
      await user.product.findOne({ _id: requestedId }).then((response) => {
        resolve(response);
      });
    });
  },

  getCardProductList: (userId) => {
    return new Promise(async (resolve, reject) => {
      let cart = await user.user.find({ user: userId });
    }).then((response) => {
      resolve(response);
    });
  },

  getProductId: (userId) => {
    return new Promise((resolve, reject) => {
      let id = user.cart
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
              _id: 0,
            },
          },
        ])
        .then((response) => {
          resolve(response);
        });
    });
  },

  totalAmount: (userId) => {
    return new Promise(async (resolve, reject) => {
      const id = await user.cart
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
              product: { $arrayElemAt: ["$carted", 0] },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: { $multiply: ["$quantity", "$product.Price"] } },
            },
          },
        ])
        .then((total) => {
          resolve(total[0]?.total);
        });
    });
  },

  getCardProdctList: (userId) => {
    return new Promise(async (resolve, reject) => {
      let id = user.cart
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
              _id: 0,
            },
          },
        ])
        .then((result) => {
          resolve(result);
        });
    });
  },

  getOrderList: (userId) => {
    return new Promise(async (resolve, reject) => {
      await user.order
        .aggregate([
          {
            $match: { user: ObjectId(userId) },
          },
          {
            $unwind: "$orders",
          },
          {
            $sort: { "orders.createdAt": -1 },
          },
          {
            $project: {
              item: "$orders",
            },
          },
          {
            $project: {
              item: 1,
            },
          },
        ])
        .then((response) => {
          console.log(response);
          resolve(response);
        });
    });
  },

  UpdateNumber: (data, userId) => {
    return new Promise(async (resolve, reject) => {
      let users = await user.user
        .updateOne(
          { _id: userId },
          {
            $set: { phonenumber: data.newNumber },
          }
        )
        .then((response) => {
          resolve(response);
        });
    });
  },

  postAddress: (userId, data) => {
    return new Promise(async (resolve, reject) => {
      let addressInfo = {
        fname: data.fname,
        lname: data.lname,
        street: data.street,
        apartment: data.apartment,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        mobile: data.mobile,
        email: data.email,
      };

      let AddressInfo = await user.address.findOne({ user: userId });
      if (AddressInfo) {
        await user.address
          .updateOne(
            { user: userId },
            {
              $push: {
                Address: addressInfo,
              },
            }
          )
          .then((response) => {
            resolve(response);
          });
      } else {
        let addressData = new user.address({
          user: userId,

          Address: addressInfo,
        });

        await addressData.save().then((response) => {
          resolve(response);
        });
      }
    });
  },

  getAddress: (userId) => {
    return new Promise(async (resolve, reject) => {
      await user.address
        .aggregate([
          {
            $match: {
              user: ObjectId(userId),
            },
          },
          {
            $unwind: "$Address",
          },

          {
            $project: {
              item: "$Address",
            },
          },

          {
            $project: {
              item: 1,
            },
          },
        ])
        .then((address) => {
          resolve(address);
        });
    });
  },

  getUserDetails: (userId) => {
    return new Promise(async(resolve, reject) => {
      await user.user.findById({_id:userId}).then((user)=>{
        
        resolve(user)
      })
      
    })
  },

  deleteAddress: (Id) => {
    console.log(Id);
    return new Promise((resolve, reject) => {
      user.address
        .updateOne(
          { _id: Id.deleteId },
          {
            $pull: { Address: { _id: Id.addressId } },
          }
        )
        .then((response) => {
          resolve({ deleteAddress: true });
        });
    });
  },

  cancelOrder: (orderId, userId) => {

    return new Promise(async (resolve, reject) => {
      let orders = await user.order.find({ "orders._id": orderId });

      let orderIndex = orders[0].orders.findIndex(
        (orders) => orders._id == orderId
      );


      let carts = await user.order
        .updateOne(
          { "orders._id": orderId },
          {
            $set: {
              ["orders." + orderIndex + ".orderConfirm"]: "cancelled",
            },
          }
        )
        .then((orders) => {
          resolve(orders);
        });
    });
  },

  returnOrder: (orderId, userId) => {

    return new Promise(async (resolve, reject) => {
      let orders = await user.order.find({ "orders._id": orderId });

      let orderIndex = orders[0].orders.findIndex(
        (orders) => orders._id == orderId
      );


      let carts = await user.order
        .updateOne(
          { "orders._id": orderId },
          {
            $set: {
              ["orders." + orderIndex + ".orderConfirm"]: "returned",
            },
          }
        )
        .then((orders) => {
          resolve(orders);
        });
    });
  },
};
