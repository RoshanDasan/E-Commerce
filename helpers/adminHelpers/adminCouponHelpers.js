const user = require("../../models/connection");
const multer = require("multer");
const voucher_codes = require("voucher-code-generator");
const { response } = require("../../app");
const ObjectId = require("mongodb").ObjectId;


module.exports = {
    getViewCoupon:()=>
    {
      return new Promise(async(resolve, reject) => {
        let coupon = await user.coupen.find().then((response)=>
        {
            resolve(response)
            
        })
      })  
    },

    addNewCoupon:(data) =>
    {
      return new Promise(async(resolve, reject) => {
      await user.coupen(data).save().then((response) => {
          console.log(response);
          resolve({ status: true });
        });
      })
    },

    generateCoupon:()=>
    {
      return new Promise(async (resolve, reject) => {
        try {
          let couponCode = voucher_codes.generate({
            length: 6,
            count: 1,
            charset: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",
            prefix: "ROSH-",
          });
          resolve({ status: true, couponCode: couponCode[0] });
        } catch (err) {
          console.log(err);
        }
      });

    }

 

    
}