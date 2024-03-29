const user = require("../../models/connection");
const multer = require("multer");
const { response, report } = require("../../app");
const ObjectId = require("mongodb").ObjectId;


module.exports = 
{


        // get all order list

  getAllOrders: () => {
    return new Promise(async (resolve, reject) => {
      let order = await user.order
        .aggregate([{ $unwind: "$orders" },
        { $sort: { "orders.createdAt": -1 } } 
      ])
        .then((response) => {
          resolve(response);
        });
    });
  },

  // get orders by category wise

  getOrderByCategory:()=>
  {
    return new Promise(async (resolve, reject) => {
      await user.order.aggregate([
        { $unwind: "$orders"},
      ]).then((response)=>
      {
        const productDetails = response.map(order => order.orders.productsDetails);
        resolve(productDetails)

      })
    })
  },

  // edit the order status

  editOrderStatus: (orderStatus) => {
    return new Promise(async (resolve, reject) => {
      await user.order
        .updateOne(
          { "orders._id": orderStatus.orderId },
          {
            $set: {
              "orders.$.orderConfirm": orderStatus.status,
            },
          }
        )
        .then((response) => {
          resolve({ update: true });
        });
    });
  },

  // get order by date

  getOrderByDate: () => {
    return new Promise(async (resolve, reject) => {
      const startDate = new Date();
      await user.order
        .find({ createdAt: { $gte: startDate } })
        .then((response) => {
          resolve(response);
        });
    });
  },

  // get order details 
  getOrderDetails:(orderId)=>
  {
    try {

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
          if (products) {
            
            resolve({ products, address, details });
          } else {
            reject('error')
          }
      });
      
    } catch (error) {
      throw(error)
    }
  }

    
}