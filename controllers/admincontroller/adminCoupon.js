const { response } = require('../../app');
const adminHelper= require('../../helpers/adminHelpers/adminProductHelpers');
const couponHelper = require('../../helpers/adminHelpers/adminCouponHelpers')
const { category } = require('../../models/connection');
const user = require("../../models/connection");


let admins
module.exports = 
{   

getViewCoupon: async(req, res)=>
 {
 let coupon = await couponHelper.getViewCoupon()
  {
    const getDate = (date) => {
      let orderDate = new Date(date);
      let day = orderDate.getDate();
      let month = orderDate.getMonth() + 1;
      let year = orderDate.getFullYear();
      return `${isNaN(day) ? "00" : day}-${isNaN(month) ? "00" : month}-${
        isNaN(year) ? "0000" : year
      }` 
}

res.render('admin/view-coupon', {coupon, getDate, layout: "adminLayout",admins})


  }

},

getAddCoupon:(req, res)=>
{
  admins = req.session.admin
    res.render('admin/add-coupon', {layout: "adminLayout",admins}) 
},
    
postAddCoupon:(req, res)=>
{
   let data = {
        couponName: req.body.couponName,
        expiry: req.body.expiry,
        minPurchase: req.body.minPurchase,
        description: req.body.description,
        discountPercentage: req.body.discountPercentage,
        maxDiscountValue: req.body.maxDiscountValue,
      };
      console.log(data);
      couponHelper.addNewCoupon(data).then((response) => {
        console.log(response);
        res.json(response);
      });
},

generateCoupon:(req, res)=>
{
  couponHelper.generateCoupon().then((response) => {
    res.json(response);
  });
}

}