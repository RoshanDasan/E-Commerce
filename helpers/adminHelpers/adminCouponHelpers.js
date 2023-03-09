const user = require("../../models/connection");
const voucher_codes = require("voucher-code-generator");


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
        }
      });

    }

 

    
}