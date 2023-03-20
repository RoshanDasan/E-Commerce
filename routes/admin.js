var express = require("express");
const adminController=require('../controllers/admincontroller/adminlogin')
const admincategorycontroller=require('../controllers/admincontroller/category')
const adminusercontroller=require('../controllers/admincontroller/adminuser')
const adminproductcontroller=require('../controllers/admincontroller/product')
const adminCouponController = require('../controllers/admincontroller/adminCoupon')
var router = express.Router();
const upload=require('../multer/multer')
const auths=require('../middlewares/middleware')

  

router.get("/",auths.auth,adminController.getDashboard)

router.get("/login",auths.auth,adminController.getAdminLogin);

router.post("/login",adminController.postAdminLogin)

router.get("/logout",auths.auth,adminController.getAdminLogOut)
 
router.get("/view_users",auths.auth,adminusercontroller.getViewUser)

router.get("/block_users/:id",auths.auth, adminusercontroller.getBlockUser)

router.get("/unblock_users/:id", auths.auth,adminusercontroller.getUnBlockUser)

router.get("/add_category",auths.auth,admincategorycontroller.getCategory)
 
router.post("/add_category",admincategorycontroller.postCategory)

router.get("/delete_category/:id",auths.auth,admincategorycontroller.deleteCategory)

router.get("/edit_category/:id",auths.auth,admincategorycontroller.editCategory)

router.post("/edit_category/:id",admincategorycontroller.postEditCategory)

router.get("/add_product",auths.auth,adminproductcontroller.getAddProduct)

router.post("/add_product",upload.uploads,adminproductcontroller.postAddProduct)

router.get("/view_product",auths.auth,adminproductcontroller.getViewproduct)

router.get("/edit_product/:id",auths.auth,adminproductcontroller.editViewProduct)

router.post("/edit_product/:id",auths.auth,upload.editeduploads,adminproductcontroller.postEditAddProduct)

router.get("/delete_product/:id",auths.auth,adminproductcontroller.deleteViewProduct)

router.put('/unlistProduct', adminproductcontroller.UnlistProduct)

router.get('/view_orders',adminController.getAllOrderds)

router.get('/coupons',auths.auth, adminCouponController.getViewCoupon)

router.get('/add_coupons',auths.auth, adminCouponController.getAddCoupon)

router.post('/add_coupons',adminCouponController.postAddCoupon)

router.get("/generate_coupon",auths.auth,adminCouponController.generateCoupon);

router.delete('/coupon_delete/:id', adminCouponController.deleteCoupon)

router.put('/orderStatus', adminproductcontroller.getEditOrderStatus)

router.get("/add_banner",auths.auth, adminController.getAddBanner)

router.post("/add_banner",upload.addBannerupload, adminController.postAddBanner)

router.get("/list_banner",auths.auth, adminController.listBanner)

router.get("/edit_banner",auths.auth, adminController.getEditBanner)

router.post("/edit_banner",upload.editBannerupload,auths.auth, adminController.postEditBanner)

router.get('/sales_report',adminController.getSalesReport)

router.post('/sales_report', adminController.postSalesReport)


module.exports = router;
