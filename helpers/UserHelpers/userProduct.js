const { response } = require("../../app.js");
const { product } = require("../../models/connection");
// const {shopProduct} = require("../../controllers/usercontroller/userProductControllers");
const user = require("../../models/connection");
const ObjectId = require("mongodb").ObjectId;

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
 

  postAdress: (userId,data) => {
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

      }
      return new Promise(async (resolve, reject) => {

        let AddressInfo = await user.address.findOne({ userid: userId })
        if (AddressInfo) {

          await user.address.updateOne({ userid: userId },
            {
              "$push":
              {
                "Address": addressInfo

              }
            }).then((response) => {


              resolve(response)
            })

        } else {

          let addressData = new user.address({
            userid: userId,

            Address: addressInfo

          })

          await addressData.save().then(() => {

            resolve(response)
          });
        }
      })
    })
  },

  placeOrder: (orderData, total) => {
    return new Promise(async (resolve, reject) => {

      let productdetails = await user.cart.aggregate([
        {
          $match: {
            user: ObjectId(orderData.user)
          }
        },
        {
          $unwind: '$cartItems'
        },


        {
          $project: {
            item: '$cartItems.productId',
            quantity: '$cartItems.Quantity',

          }
        },

        {
          $lookup: {
            from: 'products',
            localField: "item",
            foreignField: "_id",
            as: 'productdetails'
          }
        },
        {
          $unwind: '$productdetails'
        },
        {
          $project: {
            _id: "$productdetails._id",
            quantity: 1,
            productsName: "$productdetails.Productname",
            productsPrice: "$productdetails.Price",

          }
        }
      ])
   
   let address= await user.address.aggregate([
        {
          $match: {
            user: ObjectId(orderData.user)
          }
        },
        {
          $unwind: '$Address'
        },

        {
          $project: {
            item: '$Address'

          }
        },

        {
          $project: {
            item: 1,
            }
          },
         

      ])
      
      orderaddress=address[0].item;
    
      let status = orderData['payment-method'] === 'COD' ? 'paid' : 'pending'
    
      let orderdata = {

        name:orderaddress.fname,
        paymentStatus: status,
        paymentmode:orderData['payment-method'],
        paymenmethod: orderData['payment-method'],
        productDetails: productdetails,
        shippingAddress: orderaddress,
        totalPrice: total
      }


      let order = await user.order.findOne({ user: orderData.user })

      if (order) {
        await user.order.updateOne({ user: orderData.user },
          {
            '$push':
            {
              'orders': orderdata
            }
          }).then((productdetails) => {

            resolve(productdetails)
          })
      } else {
        let newOrder = user.order({
          user: orderData.user,
          orders: orderdata
        })

        await newOrder.save().then((orders) => {
          resolve(orders)
        })
      }
         await  user.cart.deleteMany({ user: orderData.user }).then(()=>{
          resolve()
         })
    
    })
  },
  checkOutpage: (userId) => {
    return new Promise(async (resolve, reject) => {

      await user.address.aggregate([
        {
          $match: {
            user: ObjectId(userId)
          }
        },
        {
          $unwind: '$Address'
        },

        {
          $project: {
            item: '$Address'

          }
        },

        {
          $project: { 
            item: 1,
            Address: { $arrayElemAt: ['$Address', 0] }
          }
        }

      ]).then((address) => {

        resolve(address)
      })


    })
  },


  deleteCart: (data) => { 
    return new Promise((resolve, reject) => {
           
            user.cart.updateOne({'_id': data.cartId },
                {"$pull":{cartItems:{productId: data.product}}}
            ).then(() => {
              
                resolve({ removeProduct: true })
            })
       
    })
  },

  
};
