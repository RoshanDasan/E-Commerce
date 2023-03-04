const user = require("../../models/connection");
const multer = require("multer");
const { response, report } = require("../../app");
const ObjectId = require("mongodb").ObjectId;

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
    console.log(userdata, filename);

    return new Promise((resolve, reject) => {
      ImageUpload = new user.product({
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
  //post editproduct

  postEditProduct: (productId, editedData, filename) => {
    // console.log(filename);
    return new Promise(async (resolve, reject) => {
      let image = filename.map((filename) => filename.filename);
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
              Image: image,
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

  getOrder: (userId) => {
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

  getAllOrders: () => {
    return new Promise(async (resolve, reject) => {
      let order = await user.order
        .aggregate([{ $unwind: "$orders" }])
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

  getOrderByDate: () => {
    return new Promise(async (resolve, reject) => {
      const startDate = new Date("2022-01-01");
      await user.order
        .find({ createdAt: { $gte: startDate } })
        .then((response) => {
          resolve(response);
        });
    });
  },

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

  addBanner: (texts, Image) => {

    return new Promise(async (resolve, reject) => {

      let banner = user.banner({
        title: texts.title,
        description: texts.description,
        link: texts.link,
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
            // created_at: updated_at,
            link: texts.link,
            image: Image
          }

        })
      resolve(response)
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
    console.log(response);
    resolve(response)
  })
})

  },
};
