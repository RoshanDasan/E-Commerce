var express = require("express");
var router = express.Router();
const controllers=require('../controllers/usercontroller/usercontroller')
const auths=require('../middlewares/middleware')


router.get("/",controllers.getHome)

router.route("/login").get(auths.userauth, controllers.getUserLogin).post(controllers.postUserLogin )

router.get("/signup",controllers.getSignUp)

router.post("/signup", controllers.postSignUp)

router.get('/otpLogin', controllers.getOtpLogin)

router.post('/otpLogin', controllers.postOtpLogin)

router.get('/otpPage', controllers.getVerify)

router.post('/otpPage', controllers.postVerify)

router.get('/profile', controllers.getProfilePage)

router.get('/update_password', controllers.getUpdatePassword)

router.post('/update_password', controllers.postUpdatePassword)

router.get("/enter_new_pwd",auths.userauth,controllers.getEnterNewPwd)

router.put("/enter_new_pwd",auths.userauth,controllers.updatePassword)

router.get("/shop",auths.userauth,controllers.shopProduct)

router.get("/category",auths.userauth,controllers.getCategory)

router.get("/image/:id", controllers.imageZoom)

router.get("/add-to-cart/:id",auths.userauth,controllers.addToCart)

router.get("/cart",auths.userauth,controllers.listCart) 

router.get("/add_to_wishlist/:prodId",auths.userauth,controllers.getWishlist);

router.get('/view_wishlist',auths.userauth,controllers.viewWishlist);

router.delete("/wishlist",controllers.deleteFromWishlist)

router.put('/change_product_quantity', auths.userauth, controllers.postchangeProductQuantity)

router.get("/check_out",auths.userauth,controllers.checkOutPage) 

router.post('/check_out',controllers.postcheckOutPage)

router.post('/verify_payment', auths.userauth, controllers.postVerifyPayment)

router.get("/add_address",auths.userauth,controllers.getAddresspage)

router.post("/add_address",auths.userauth, controllers.postAddresspage)

router.get("/add_new_address",auths.userauth,controllers.getNewAddresspage)

router.post("/add_new_address",auths.userauth, controllers.postNewAddresspage)

router.get('/edit_address', auths.userauth, controllers.getEditAddress)

router.post('/edit_address',auths.userauth, controllers.postEditAddress)

router.delete('/delete_cart_item',auths.userauth, controllers.getDeleteCart)

router.get('/change_number',auths.userauth, controllers.getChangeNumber)

router.post('/change_number', controllers.postChangeNumber)

router.get('/view_address',auths.userauth, controllers.getViewAddress)

router.delete('/delete_address', controllers.deleteAddress)

router.get('/order',auths.userauth,controllers.getOrderList)

router.get('/order_success',auths.userauth, controllers.GetSuccessPage)

router.get('/order_details',auths.userauth,controllers.orderDetails)

router.get('/order_cancel/:id', controllers.getCancelOrder)

router.get('/order_return/:id', controllers.getReturnOrder)

router.get('/coupon_validator', controllers.applyCouponSuccess) 

router.get('/coupon_verify', controllers.couponVerify)

router.get('/apply_coupon', controllers.applyCoupon)

router.post('/search',auths.userauth,controllers.getSearch)

router.post('/sort',auths.userauth,controllers.postSort)

router.get("/logout",controllers.getLogout);


module.exports = router;
