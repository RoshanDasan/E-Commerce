const { response } = require("../../app.js");
const { product, order } = require("../../models/connection");
// const {shopProduct} = require("../../controllers/usercontroller/userProductControllers");
const user = require("../../models/connection");
const ObjectId = require("mongodb").ObjectId;
const Razorpay = require("razorpay");
const razorpay = require("../../OTP/razorpay");
const instance = new Razorpay({
  key_id: "rzp_test_35L6RvxfjNKTJy",
  key_secret: "CvzeTNUXZnWdLhBZIMPDLC99",
});

let easyinvoice = require('easyinvoice');
const fs = require('fs');
const { resolve } = require("path");


//display shop

module.exports = {
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

  postAdress: (userId, data) => {
    return new Promise((resolve, reject) => {
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
      return new Promise(async (resolve, reject) => {
        let AddressInfo = await user.address.findOne({ userid: userId });
        if (AddressInfo) {
          await user.address
            .updateOne(
              { userid: userId },
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
            userid: userId,

            Address: addressInfo,
          });

          await addressData.save().then(() => {
            resolve(response);
          });
        }
      });
    });
  },

  placeOrder: (orderData, total) => {
    return new Promise(async (resolve, reject) => {
      let productdetails = await user.cart.aggregate([
        {
          $match: {
            user: ObjectId(orderData.user),
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
            as: "productdetails",
          },
        },
        {
          $unwind: "$productdetails",
        },

        {
          $project: {
            image: "$productdetails.Image",
            category: "$productdetails.category",
            _id: "$productdetails._id",
            quantity: 1,
            productsName: "$productdetails.Productname",
            productsPrice: "$productdetails.Price",
          },
        },
      ]);

      console.log(productdetails, "-----product");

      console.log("-------", orderData);
      let Address = await user.address.aggregate([
        { $match: { user: ObjectId(orderData.user) } },

        { $unwind: "$Address" },

        { $match: { "Address._id": ObjectId(orderData.address) } },

        { $unwind: "$Address" },

        {
          $project: {
            item: "$Address",
          },
        },
      ]);
      console.log("-----address", Address);
      const items = Address.map((obj) => obj.item);
      console.log(items[0], "item-----");
      let orderaddress = items[0];
      let status = orderData["payment-method"] === "COD" ? "placed" : "pending";
      let orderstatus =
        orderData["payment-method"] === "COD" ? "success" : "pending";
      let orderdata = {
        name: orderaddress.fname,
        paymentStatus: status,
        paymentmode: orderData["payment-method"],
        paymenmethod: orderData["payment-method"],
        productsDetails: productdetails,
        shippingAddress: orderaddress,
        OrderStatus: orderstatus,
        totalPrice: total,
      };

      console.log(orderdata);

      let order = await user.order.findOne({ user: orderData.user });

      if (order) {
        await user.order
          .updateOne(
            { user: orderData.user },
            {
              $push: {
                orders: orderdata,
              },
            }
          )
          .then((productdetails) => {
            console.log(productdetails);

            resolve(productdetails);
          });
      } else {
        let newOrder = user.order({
          user: orderData.user,
          orders: orderdata,
        });

        await newOrder.save().then((orders) => {
          console.log("created====", orders);
          resolve(orders);
        });
      }
      await user.cart.deleteMany({ user: orderData.user }).then(() => {
        resolve();
      });
    });
  },

  checkOutpage: (userId) => {
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
              Address: { $arrayElemAt: ["$Address", 0] },
            },
          },
        ])
        .then((address) => {
          resolve(address);
        });
    });
  },

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
        console.log(error);
      }
    });
  },

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
        console.log(error);
      }
    });
  },

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
        console.log(usedCoupon.length);
        if (usedCoupon.length == 1) {
          resolve({ status: true });
          console.log("hii");
        }
      } catch (err) {
        console.log(err);
      }
    });
  },

  generateRazorpay: (userId, total) => {
    console.log(userId, total);

    return new Promise(async (resolve, reject) => {
      let orders = await user.order.find({ user: userId });

      let order = orders[0].orders.slice().reverse();
      let orderId = order[0]._id;
      total = total * 100;
      var options = {
        amount: parseInt(total),
        currency: "INR",
        receipt: "" + orderId,
      };
      instance.orders.create(options, function (err, order) {
        if (err) {
          console.log(err);
        } else {
          resolve(order);
          console.log("=====", order);
        }
      });
    });
  },

  verifyPayment: (details) => {
    return new Promise((resolve, reject) => {
      try {
        console.log("hlo");
        const crypto = require("crypto");
        let hmac = crypto.createHmac("sha256", razorpay.key_secret);
        hmac.update(
          details["payment[razorpay_order_id]"] +
            "|" +
            details["payment[razorpay_payment_id]"]
        );
        hmac = hmac.digest("hex");
        if (hmac == details["payment[razorpay_signature]"]) {
          resolve();
        } else {
          reject("not match");
        }
      } catch (err) {
        console.log(err);
      }
    });
  },

  changePaymentStatus: (userId, orderId) => {
    console.log(orderId);
    return new Promise(async (resolve, reject) => {
      try {
        let users = await user.order.updateOne(
          { "orders._id": orderId },
          {
            $set: {
              "orders.$.OrderStatus": "success",
              "orders.$.paymentStatus": "paid",
            },
          }
        );
        await user.cart.deleteMany({ user: userId });
        resolve();
      } catch (err) {
        console.log(err);
      }
    });
  },

  viewOrderDetails: (orderId) => {
    return new Promise(async (resolve, reject) => {
      let productid = await user.order.findOne(
        { "orders._id": orderId },
        { "orders.$": 1 }
      );

      let details = productid.orders[0];
      let order = productid.orders[0].productsDetails;

      const address = productid.orders.map((object) => object.shippingAddress);
      const productDetails = productid.orders.map(
        (object) => object.productsDetails
      );
      const products = productDetails.map((object) => object);

      resolve({ products, address, details });
    });
  },

  createData:(details)=>
  {
    let address = details.address[0]
    let product = details.products[0][0]
    let orderDetails = details.details
    console.log('address',address);
    console.log('product',product);
    console.log('orderdetails',orderDetails);

    var data = {
      // Customize enables you to provide your own templates
      // Please review the documentation for instructions and examples
      customize: {
        //  "template": fs.readFileSync('template.html', 'base64') // Must be base64 encoded html
      },
      images: {
        // The logo on top of your invoice
        logo: "https://freelogocreator.com/user_design/logos/2023/02/28/120325-medium.png",
        // The invoice background
        // background: "https://public.easyinvoice.cloud/img/watermark-draft.jpg",
      },
      // Your own data
      sender: {
        company: "RoshanCart",
        address: "Washington DC",
        zip: "4567 CD",
        city: "Los santos",
        country: "America",
       
      },
      // Your recipient
      client: {
    
        company: address.fname,
        address: address.street,
        zip: address.pincode,
        city: address.city,
        country: "India",
      },

      information: {
        number: address.mobile,
        date: "12-12-2021",
        "due-date": "31-12-2021",
      },

      products: [
        {
          quantity: product.quantity,
          description: product.productsName,
          "tax-rate": 6,
          price: product.productsPrice,
        },
      ],
      // The message you would like to display on the bottom of your invoice
      "bottom-notice": "Thank you for your order from RoshanCart",
      // Settings to customize your invoice
      settings: {
        currency: "INR", // See documentation 'Locales and Currency' for more info. Leave empty for no currency.
        // "locale": "nl-NL", // Defaults to en-US, used for number formatting (See documentation 'Locales and Currency')
        // "tax-notation": "gst", // Defaults to 'vat'
        // "margin-top": 25, // Defaults to '25'
        // "margin-right": 25, // Defaults to '25'
        // "margin-left": 25, // Defaults to '25'
        // "margin-bottom": 25, // Defaults to '25'
        // "format": "A4", // Defaults to A4, options: A3, A4, A5, Legal, Letter, Tabloid
        // "height": "1000px", // allowed units: mm, cm, in, px
        // "width": "500px", // allowed units: mm, cm, in, px
        // "orientation": "landscape", // portrait or landscape, defaults to portrait
      },
      // Translate your invoice to your preferred language
      translate: {
        // "invoice": "FACTUUR",  // Default to 'INVOICE'
        // "number": "Nummer", // Defaults to 'Number'
        // "date": "Datum", // Default to 'Date'
        // "due-date": "Verloopdatum", // Defaults to 'Due Date'
        // "subtotal": "Subtotaal", // Defaults to 'Subtotal'
        // "products": "Producten", // Defaults to 'Products'
        // "quantity": "Aantal", // Default to 'Quantity'
        // "price": "Prijs", // Defaults to 'Price'
        // "product-total": "Totaal", // Defaults to 'Total'
        // "total": "Totaal" // Defaults to 'Total'
      },
    };

    console.log(data);
    return data;
  }

  
};
