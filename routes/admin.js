var express = require("express");
const { getMaxListeners } = require("../app");
const adminController=require('../controllers/admincontroller/adminlogin')
const admincategorycontroller=require('../controllers/admincontroller/category')
const adminHelper=require('../helpers/adminHelpers/adminProductHelpers')
const adminusercontroller=require('../controllers/admincontroller/adminuser')
const adminproductcontroller=require('../controllers/admincontroller/product')
var router = express.Router();
const user = require("../models/connection");
const multer= require('multer');
const { doLogin } = require("../helpers/UserHelpers/UserHelpers");
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

router.get("/order/:id", adminproductcontroller.getOrderList)



module.exports = router;
