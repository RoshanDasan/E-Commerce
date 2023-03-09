const { response } = require("../../app.js");
const user = require("../../models/connection");
const ObjectId = require("mongodb").ObjectId;
const Razorpay = require("razorpay");
const razorpay = require("../../OTP/razorpay");
const instance = new Razorpay({
  key_id: "rzp_test_35L6RvxfjNKTJy",
  key_secret: "CvzeTNUXZnWdLhBZIMPDLC99",
});

module.exports = {
  // get order list by user

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
          resolve(response);
        });
    });
  },

  // cancel an order

  cancelOrder: (orderId, userId) => {
    return new Promise(async (resolve, reject) => {
      let orders = await user.order.find({ "orders._id": orderId });

      let orderIndex = orders[0].orders.findIndex(
        (orders) => orders._id == orderId
      );

      await user.order
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

  // return an order

  returnOrder: (orderId, userId) => {
    return new Promise(async (resolve, reject) => {
      let orders = await user.order.find({ "orders._id": orderId });

      let orderIndex = orders[0].orders.findIndex(
        (orders) => orders._id == orderId
      );

      await user.order
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

  // total checkout amount

  totalCheckOutAmount: (userId) => {
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
              product: { $arrayElemAt: ["$carted", 0] },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: { $multiply: ["$quantity", "$product.offerPrice"] } },
            },
          },
        ])
        .then((total) => {
          resolve(total[0]?.total);
        });
    });
  },

  // find subtotal

  subtotal: (userId) => {
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

              price: {
                $arrayElemAt: ["$carted.offerPrice", 0],
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

  // place your order

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
            productsOfferPrice: "$productdetails.offerPrice",
            productsOffer: "$productdetails.offerPercentage",


          },
        },
      ]);

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
      const items = Address.map((obj) => obj.item);

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
            resolve(productdetails);
          });
      } else {
        let newOrder = user.order({
          user: orderData.user,
          orders: orderdata,
        });

        await newOrder.save().then((orders) => {
          resolve(orders);
        });
      }
      await user.cart.deleteMany({ user: orderData.user }).then(() => {
        resolve();
      });
    });
  },

  // get chackout page

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

  // view order details

  viewOrderDetails: (orderId) => {
    return new Promise(async (resolve, reject) => {
      let productid = await user.order.findOne(
        { "orders._id": orderId },
        { "orders.$": 1 }
      );

      let details = productid.orders[0];

      const address = productid.orders.map((object) => object.shippingAddress);
      const productDetails = productid.orders.map(
        (object) => object.productsDetails
      );
      const products = productDetails.map((object) => object);

      resolve({ products, address, details });
    });
  },

  // cahnge payment status

  changePaymentStatus: (userId, orderId) => {
    return new Promise(async (resolve, reject) => {
      try {
        await user.order.updateOne(
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
        throw err;
      }
    });
  },

  // online payment

  // creat razorpay

  generateRazorpay: (userId, total) => {
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
        } else {
          resolve(order);
        }
      });
    });
  },

  // verify the payment

  verifyPayment: (details) => {
    return new Promise((resolve, reject) => {
      try {
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
      } catch (err) {}
    });
  },

  // creating data for invoice
  createData: (details) => {
    let address = details.address[0];
    let product = details.products[0][0];

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
      },
      // Translate your invoice to your preferred language
      translate: {},
    };

    return data;
  },
};
