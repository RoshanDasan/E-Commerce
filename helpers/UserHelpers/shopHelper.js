const { response } = require("../../app");
const user = require("../../models/connection");
const ObjectId = require("mongodb").ObjectId;


module.exports = {
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

  // get category by name

  category: (categoryName) => {
    return new Promise(async (resolve, reject) => {
      await user.product.find({ category: categoryName }).then((response) => {
        resolve(response);
      });
    });
  },

  // banner

  getBannetData: () => {
    return new Promise(async (resolve, reject) => {
      await user.banner.find().then((response) => {
        resolve(response);
      });
    });
  },

  // image zoom products

  imageZoom: (requestedId) => {
    return new Promise(async (resolve, reject) => {
      await user.product.findOne({ _id: requestedId }).then((response) => {
        resolve(response);
      });
    });
  },

  // address section
  
  // get address of the user

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

  // add address

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

  // delete address

  deleteAddress: (Id) => {
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


  // coupon helpers

  // apply coupon
  applyCoupon: (code, total) => {
    return new Promise(async (resolve, reject) => {
      try {
        let coupon = await user.coupen.findOne({ couponName: code });
        if (coupon) {
          //checking coupon Valid

          if (new Date(coupon.expiry) - new Date() > 0) {
            //checkingExpiry
            if (total >= coupon.minPurchase) {
              //checking max offer value
              let discountAmount = (total * coupon.discountPercentage) / 100;
              if (discountAmount > coupon.maxDiscountValue) {
                discountAmount = coupon.maxDiscountValue;
                resolve({ status: true, discountAmount: discountAmount });
              } else {
                resolve({ status: true, discountAmount: discountAmount });
              }
            } else {
              resolve({
                status: false,
                reason: `Minimum purchase value is ${coupon.minPurchase}`,
              });
            }
          } else {
            resolve({ status: false, reason: "coupon Expired" });
          }
        }
      } catch (error) {
        throw error;
      }
    });
  },

  // validate a coupon

  couponValidator: (code, userId) => {
    return new Promise(async (resolve, reject) => {
      try {
        let couponExists = await user.coupen.findOne({ couponName: code });

        if (couponExists) {
          if (new Date(couponExists.expiry) - new Date() > 0) {
            let userCouponExists = await user.user.findOne({
              _id: userId,
              "coupons.couponName": code,
            });
            if (!userCouponExists) {
              couponObj = {
                couponName: code,
                user: false,
              };
              user.user
                .updateOne(
                  { _id: userId },
                  {
                    $push: {
                      coupons: couponObj,
                    },
                  }
                )
                .then(() => {
                  resolve({ status: true });
                });
            } else {
              resolve({ status: false, reason: "coupon already used" });
            }
          } else {
            resolve({ status: false, reason: "coupon expired" });
          }
        } else {
          resolve({ status: false, reason: "coupon does'nt exist" });
        }
      } catch (error) {
        throw error;
      }
    });
  },

  // verify a coupon

  couponVerify: (code, userId) => {
    return new Promise(async (resolve, reject) => {
      try {
        let usedCoupon = await user.user.aggregate([
          {
            $match: { _id: ObjectId(userId) },
          },
          {
            $unwind: "$coupons",
          },
          {
            $match: { _id: ObjectId(userId) },
          },
          {
            $match: {
              $and: [{ "coupons.couponName": code }, { "coupons.user": false }],
            },
          },
        ]);
        if (usedCoupon.length == 1) {
          resolve({ status: true });
        }
      } catch (err) {
        throw err;
      }
    });
  },

  // search product

  productSearch: (searchData) => {
    let keyword = searchData.search;
    return new Promise(async (resolve, reject) => {
      try {
        const products = await user.product.find({
          Productname: { $regex: new RegExp(keyword, "i") },
        });

        if (products.length > 0) {
          resolve(products);
        } else {
          reject("No products found.");
        }
      } catch (err) {
        reject(err);
      }
    });
  },

  // sort product by price

  postSort: (sortOption) => {
    return new Promise(async (resolve, reject) => {
      let products;
      if (sortOption === "price-low-to-high") {
        products = await user.product.find().sort({ Price: 1 }).exec();
      } else if (sortOption === "price-high-to-low") {
        products = await user.product.find().sort({ Price: -1 }).exec();
      } else {
        products = await user.product.find().exec();
      }
      resolve(products);
    });
  },


  // get related products by the category to add on image zoom page

  getProductByCategory:(category) =>
  {
    return new Promise(async(resolve, reject) => {
      await user.product.find({category:category}).then((response)=>
      {
        resolve(response)
      })
    })
  }
};
