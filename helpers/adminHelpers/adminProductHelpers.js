const { response } = require("../../app");
const user = require("../../models/connection");

module.exports = {
  //get add product

  getAddProduct: () => {
    return new Promise(async (resolve, reject) => {
      await user.category
        .find()
        .exec()
        .then((response) => {
          resolve(response);
        });
    });
  },

  //post add product

  postAddProduct: (userdata, filename) => {

    return new Promise((resolve, reject) => {
      let ImageUpload = new user.product({
        Productname: userdata.name,
        ProductDescription: userdata.description,
        Quantity: userdata.quantity,
        Image: filename,
        category: userdata.category,
        Price: userdata.price,
      });
      ImageUpload.save().then((data) => {
        resolve(data);
      });
    });
  },
  //get view product

  getViewProduct: () => {
    return new Promise(async (resolve, reject) => {
      await user.product
        .find()
        .exec()
        .then((response) => {
          resolve(response);
        });
    });
  },
  //delete view product

  deleteViewProduct: (productId) => {
    return new Promise(async (resolve, reject) => {
      await user.product.deleteOne({ _id: productId }).then((response) => {
        resolve(response);
      });
    });
  },
  //edit product

  editProduct: (productId) => {
    return new Promise(async (resolve, reject) => {
      await user.product
        .findOne({ _id: productId })
        .exec()
        .then((response) => {
          resolve(response);
        });
    });
  },

  // unlist product
  unlistProduct:(proId, condition)=>
  {
    return new Promise(async (resolve, reject) => {
      await user.product.updateOne({_id:proId},
        {$set:{unlist:condition}}).then((response)=>
        {
          resolve(response)
        }).catch((err)=>
        {
          reject(err)
        })
    })

  },
  //post editproduct
  postEditProduct: (productId, editedData, filename) => {
    return new Promise(async (resolve, reject) => {
      let offerPrice = editedData.price;
      if (editedData.offer != 0) {
        offerPrice = Math.floor(editedData.price-(editedData.price*editedData.offer/100));
      }

      await user.product
        .updateOne(
          { _id: productId },
          {
            $set: {
              Productname: editedData.name,
              ProductDescription: editedData.description,
              Quantity: editedData.quantity,
              Price: editedData.price,
              category: editedData.category,
              offerPercentage: editedData.offer,
              offerPrice: offerPrice,
              Image: filename,
            },
          }
        )
        .then((response) => {
          resolve(response);
        });
    });
   
  },
  
  //  imported from view category

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

  getAllProducts: () => {
    return new Promise(async (resolve, reject) => {
      await user.product.find().then((response) => {
        resolve(response);
      });
    });
  },



  

  addBanner: (texts, Image) => {

    return new Promise(async (resolve, reject) => {

      let banner = user.banner({
        title: texts.title,
        description: texts.description,
        image: Image

      })
      await banner.save().then((response) => {
        resolve(response)
      })
    })
  },

  /// list banner
  listBanner: () => {

    return new Promise(async (resolve, reject) => {
      await user.banner.find().exec().then((response) => {
        resolve(response)
      })
    })
  },

  // edit banner

  editBanner: (bannerId) => {

    return new Promise(async (resolve, reject) => {

      let bannerid = await user.banner.findOne({ _id: bannerId }).then((response) => {
        resolve(response)
      })

    })

  },

  //post edit banner

  postEditBanner: (bannerid, texts, Image) => {

    return new Promise(async (resolve, reject) => {

      let response = await user.banner.updateOne({ _id: bannerid },
        {
          $set: {

            title: texts.title,
            description: texts.description,
            image: Image
          }

        })
      resolve(response)
    })

  },

  deleteBanner:(deleteId)=>
  {
    return new Promise(async (resolve, reject) => {
      await user.banner.deleteOne({_id: deleteId}).then((response)=>
      {
        resolve(response)
      })
    })
  },

  getCodCount: () => {
    return new Promise(async (resolve, reject) => {
      let response = await user.order.aggregate([
        {
          $unwind: "$orders",
        },
        {
          $match: {
            "orders.paymentmode": "COD",
          },
        },
      ]);
      resolve(response);
    });
  },

  getOnlineCount: () => {
    return new Promise(async (resolve, reject) => {
      let response = await user.order.aggregate([
        {
          $unwind: "$orders",
        },
        {
          $match: {
            "orders.paymentmode": "online",
          },
        },
      ]);
      resolve(response);
    });
  },

  getWalletCount:()=>
  {
    return new Promise(async (resolve, reject) => {
      let response = await user.order.aggregate([
        {
          $unwind: "$orders",
        },
        {
          $match: {
            "orders.paymentmode": "wallet",
          },
        },
      ]);
      resolve(response);
    });

  },

  getSalesReport: async () => {
    return new Promise(async (resolve, reject) => {
      let response = await user.order.aggregate([
        {
          $unwind: "$orders",
        },
        {
          $match: {
            "orders.orderConfirm": "delivered",
          },
        },
      ]);
      resolve(response);
    });
  },
  postReport: (date) => {
    let start = new Date(date.startdate);
  let end = new Date(date.enddate);

  return new Promise(async(resolve, reject) => {
  await user.order.aggregate([
  {
    $unwind: "$orders",
  },
  {
    $match: {
      $and: [
        { "orders.orderConfirm": "delivered" },
        {"orders.createdAt": { $gte: start, $lte: end }}
        
      ]
    }
  }
])
  .exec()
  .then((response) => {
    resolve(response)
  })
})

  },
};
