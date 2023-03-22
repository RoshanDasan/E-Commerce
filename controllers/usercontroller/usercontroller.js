const userhelpers = require("../../helpers/UserHelpers/userRegisterHelper");
const userproductHelpers = require("../../helpers/UserHelpers/productHelper");
const shopHelpers = require("../../helpers/UserHelpers/shopHelper");
const orderHelpers = require("../../helpers/UserHelpers/orderHelper");
const cartAndWishlistHelpers = require("../../helpers/UserHelpers/cartAndWishlistHelper");

const adminCategoryHelper = require("../../helpers/adminHelpers/adminCategoryHelper");
const otpLogin = require("../../OTP/otpLogin");
const client = require("twilio")(otpLogin.AccountSId, otpLogin.authtoken);
const db = require("../../models/connection");

const userRegisterHelper = require("../../helpers/UserHelpers/userRegisterHelper");

let total, count, wishcount, users, user, mobilenumber;
module.exports = {
  // user home
  getHome: async (req, res) => {
    let bannerData = await shopHelpers.getBannetData();

    if (req.session.loggedIn) {
      let users = req.session.user;
      count = await cartAndWishlistHelpers.getCartCount(req.session.user.id);
      wishcount = await cartAndWishlistHelpers.getWishCount(req.session.user.id);

      res.render("user/user", { users, count, bannerData, wishcount ,userExist : true});
    } else {
      res.render("user/user", { bannerData, userExist: false });
    }
  },
  getUserLogin: (req, res) => {
    if (req.session.loggedIn) {
      res.redirect("/");
    } else {
      res.render("user/login");
    }
  },
  // post user login
  postUserLogin: (req, res) => {
    console.log(req.body);
    userhelpers.doLogin(req.body).then((response) => {
      console.log(response);
      req.session.loggedIn = true;
      req.session.user = response;

      let loggedinstatus = response.loggedinstatus;
      let blockedStatus = response.blockedStatus;

      if (loggedinstatus == true) {
        res.redirect("/");
      } else {
        res.render("user/login", { blockedStatus, loggedinstatus });
      }
    });
  },
  //get signup

  getSignUp: (req, res) => {
    let emailStatus = true;
    if (req.session.loggedIn) {
      res.redirect("/login");
    } else {
      res.render("user/signup", { emailStatus });
    }
  },
  //post sign up
  postSignUp: (req, res) => {
    userhelpers.doSignUp(req.body).then((response) => {
      let emailStatus = response.status;
      if (emailStatus) {
        res.redirect("/login");
      } else {
        res.render("user/signup", { emailStatus });
      }
    });
  },
  //getuser logout

  getLogout: (req, res) => {
    req.session.loggedIn = null;
    res.render("user/login");
  },

  getUpdatePassword: (req, res) => {
    res.render("user/update-password");
  },

  postUpdatePassword: (req, res) => {
    userhelpers.doUpdatePassword(req.body).then((response) => {
      if (response.update) {
        res.redirect("/login");
      } else {
        res.render("user/update-password", { updateStaus: true });
      }
    });
  },

  getEnterNewPwd: async (req, res) => {
    let user = req.session.user.id;
    let users = req.session.user;
    wishcount = await cartAndWishlistHelpers.getWishCount(req.session.user.id);

    res.render("user/enter-pwd", { user, users, count, wishcount });
  },

  updatePassword: async (req, res) => {
    let passResponse = await userhelpers.verifyPassword(
      req.body,
      req.query.proId
    );

    if (passResponse) {
      res.json(true);
    } else {
      res.json(false);
    }
  },

  getOtpLogin: (req, res) => {
    res.render("user/otpLogin");
  },

  postOtpLogin: async (req, res) => {
    mobilenumber = req.body.number;
    let users = await db.user.findOne({ phonenumber: mobilenumber }).exec();

    if (users == false) {
      res.render("user/otpLogin", { userExist: true });
    } else {
      client.verify.v2
        .services(process.env.serviceId)
        .verifications.create({ to: `+91 ${mobilenumber}`, channel: "sms" })
        .then((verification) => console.log(verification.status))
        .then(() => {
          const readline = require("readline").createInterface({
            input: process.stdin,
            output: process.stdout,
          });
        });
    }

    res.render("user/otpPage");
  },

  getVerify: (req, res) => {
    res.render("user/otpPage");
  },

  postVerify: async (req, res) => {
    let otpNumber = req.body.otp;
  
    let getUser = await userRegisterHelper.getUser(mobilenumber)
    console.log(getUser);

    client.verify.v2
      .services(otpLogin.serviceId)
      .verificationChecks.create({ to: `+91 ${mobilenumber}`, code: otpNumber })
      .then(async (verification_check) => {
        if (verification_check.status == "approved") {
          req.session.user = getUser
          req.session.loggedIn = true;
          res.redirect('/')

       
        } else {
          res.render("user/otpPage", { invalidOtp: true });
        }
      });
  },

  getProfilePage: async (req, res) => {
    let user = req.session.user.id;
    let users = req.session.user;
    let userDetails = await userhelpers.getUserDetails(req.session.user.id);
    let count = await cartAndWishlistHelpers.getCartCount(req.session.user.id);
    wishcount = await cartAndWishlistHelpers.getWishCount(req.session.user.id);

    res.render("user/profilee", { users, count, user, userDetails, wishcount });
  },

  shopProduct: async (req, res) => {
    let pageNum = req.query.page;
    console.log(pageNum);
    let perpage = 6;
    let users = req.session.user;
    let docCount = await userproductHelpers.getDocCount();
    let pages = Math.ceil(parseInt(docCount) / perpage);

    let categories = await adminCategoryHelper.viewAddCategory();
    let count = await cartAndWishlistHelpers.getCartCount(req.session.user.id);
    wishcount = await cartAndWishlistHelpers.getWishCount(req.session.user.id);

    await userproductHelpers.shopListProducts(pageNum).then((response) => {
      res.render("user/shop", {
        response,
        count,
        users,
        categories,
        pageNum,
        pages,
        wishcount,
      });
    });
  },

  getCategory: async (req, res) => {
    let users = req.session.user;

    let viewCategory = await adminCategoryHelper.viewAddCategory();

    shopHelpers.category(req.query.cname).then((response) => {
      res.render("user/filter-by-category", {
        response,
        users,
        viewCategory,
        count,
        wishcount,
      });
    });
  },

  imageZoom: async (req, res) => {
    let user = req.session.user.id;
    let users = req.session.user;
    let count = await cartAndWishlistHelpers.getCartCount(req.session.user.id);
    let image = await shopHelpers.imageZoom(req.params.id);
    let relatedProducts = await shopHelpers.getProductByCategory(
      image.category
    );

    res.render("user/imagezoom", {
      image,
      count,
      user,
      users,
      wishcount,
      relatedProducts,
    });
  },

  // get add-to-cart

  addToCart: async (req, res) => {
    cartAndWishlistHelpers
      .addToCartItem(req.params.id, req.session.user.id, count)
      .then((response) => {
        res.json(response);
      });
  },

  //list cart  page

  listCart: async (req, res) => {
    let count = await cartAndWishlistHelpers.getCartCount(req.session.user.id);
    wishcount = await cartAndWishlistHelpers.getWishCount(req.session.user.id);

    let users = req.session.user;
    let userId = req.session.user;
    total = await orderHelpers.totalCheckOutAmount(req.session.user.id);

    let subtotal = await orderHelpers.subtotal(req.session.user.id);

    cartAndWishlistHelpers
      .listAddToCart(req.session.user.id)
      .then((cartItems) => {
        res.render("user/cart", {
          cartItems,
          total,
          subtotal,
          userId,
          users,
          count,
          wishcount,
        });
      });
  },

  getDeleteCart: (req, res) => {
    cartAndWishlistHelpers.deleteCart(req.body).then((response) => {
      res.json(response);
    });
  },

  viewWishlist: async (req, res) => {
    let user = req.session.user.id;
    let users = req.session.user;
    let count = await cartAndWishlistHelpers.getCartCount(req.session.user.id);
    wishcount = await cartAndWishlistHelpers.getWishCount(req.session.user.id);
    let wishlistItems = await cartAndWishlistHelpers.viewWishlist(req.session.user.id);

    console.log(wishlistItems);
    res.render("user/wishlist", {
      users,
      user,
      count,
      wishlistItems,
      wishcount,
      count,
    });
  },
  getWishlist: async (req, res) => {
    cartAndWishlistHelpers
      .addToWishlist(req.params.prodId, req.session.user.id)
      .then((data) => {
        res.json({ status: true });
      });
  },

  deleteFromWishlist: async (req, res) => {
    let deleteData = await cartAndWishlistHelpers.deleteWishlist(req.body);
    if (deleteData) {
      res.json(true);
    }
  },

  getSearch: async (req, res) => {
    let user = req.session.user.id;
    let users = req.session.user;

    let viewCategory = await adminCategoryHelper.viewAddCategory();

    shopHelpers
      .productSearch(req.body)
      .then((response) => {
        res.render("user/filter-by-category", {
          response,
          users,
          viewCategory,
          user,
          count,
          wishcount,
        });
      })
      .catch((err) => {
        res.render("user/filter-by-category", {
          err,
          viewCategory,
          user,
          users,
          count,
          wishcount,
        });
      });
  },

  postSort: async (req, res) => {
    let user = req.session.user.id;
    let users = req.session.user;
    let sortOption = req.body["selectedValue"];
    let viewCategory = await adminCategoryHelper.viewAddCategory();
    shopHelpers.postSort(sortOption).then((response) => {
      res.render("user/filter-by-category", {
        user,users,
        response,
        viewCategory,
        count,
        wishcount,
      });
    });
  },

  getViewCart: async (req, res) => {
    let user = req.session.user.id;
    let users = req.session.user;
    total = await orderHelpers.totalCheckOutAmount(req.session.user.id);
    let count = await cartAndWishlistHelpers.getCartCount(req.session.user.id);
    wishcount = await cartAndWishlistHelpers.getWishCount(req.session.user.id);

    let cartItems = await userhelpers.viewCart(req.session.user.id);

    res.render("user/view-cart", {
      cartItems,
      user,
      users,
      userSession,
      profileId,
      count,
      total,
      wishcount,
    });
  },

  checkOutPage: async (req, res) => {
    let user = req.session.user.id;
    let users = req.session.user;

    let walletAmount;

    let cartItems = await cartAndWishlistHelpers.listAddToCart(
      req.session.user.id
    );
    let total = await orderHelpers.totalCheckOutAmount(req.session.user.id);
    let checkWallet = await orderHelpers.getWallet(req.session.user.id);

    if (checkWallet >= total) {
      walletAmount = true;
    } else {
      walletAmount = false;
    }

    console.log(users.id);
    orderHelpers.checkOutpage(req.session.user.id).then((response) => {
      let addressLength = response.length;
      res.render("user/checkout", {
        users,
        user,
        cartItems,
        total,
        response,
        addressLength,
        count,
        wishcount,
        walletAmount,
      });
    });
  },

  postcheckOutPage: async (req, res) => {
    console.log(req.body);
    let total = req.body.total
    let couponName = req.body.couponCode

    await orderHelpers.addCouponToUser(couponName,req.session.user.id)

    let proId = await orderHelpers.getProId(req.body);

    await orderHelpers.ChangeQuantity(proId);

    await orderHelpers.placeOrder(req.body, total).then(async (result) => {
      if (req.body["payment-method"] == "COD") {
        res.json({ codstatus: true });
      } else if (req.body["payment-method"] == "online") {
        await orderHelpers
          .generateRazorpay(req.session.user.id, total)
          .then((order) => {
            res.json(order);
          });
      } else {
        res.json({ codstatus: true });
        await orderHelpers.reduceWallet(req.session.user.id, total);
      }
    });
  },

  getAddresspage: (req, res) => {
    let users = req.session.user;

    let user = req.session.user.id;
    res.render("user/add-address", { user, users, wishcount, count });
  },

  postAddresspage: async (req, res) => {
    await shopHelpers
      .postAddress(req.session.user.id, req.body)
      .then((data) => {
        res.redirect("/check_out");
      });
  },

  getNewAddresspage: (req, res) => {
    let users = req.session.user;
    let user = req.session.user.id;
    res.render("user/add-new-address", { user, users, wishcount, count });
  },

  postNewAddresspage: async (req, res) => {
    await shopHelpers
      .postAddress(req.session.user.id, req.body)
      .then((data) => {
        res.redirect("/profile");
      });
  },

  getEditAddress:async (req, res)=>
  {
    let users = req.session.user;
    let user = req.session.user.id;
    let editData = await shopHelpers.getEditAddress(req.query.id)
    console.log(editData);
    res.render("user/edit-address", {editData, user, users, wishcount, count });
  },

  postEditAddress:async (req, res)=>
  {
    try {
      await shopHelpers.editAddress(req.body.addressId, req.body)
      res.redirect('/view_address')
    } catch (error) {
      
    }
  },

  postchangeProductQuantity: async (req, res) => {
    await userproductHelpers
      .changeProductQuantity(req.body)
      .then(async (response) => {
        response.total = await orderHelpers.totalCheckOutAmount(req.body.user);

        res.json(response);
      });
  },

  getOrderList: (req, res) => {
    let users = req.session.user;
    let user = req.session.user.id;
    const getDate = (date) => {
      let orderDate = new Date(date);
      let day = orderDate.getDate();
      let month = orderDate.getMonth() + 1;
      let year = orderDate.getFullYear();
      return `${isNaN(day) ? "00" : day}-${isNaN(month) ? "00" : month}-${
        isNaN(year) ? "0000" : year
      }`;
    };

    orderHelpers.getOrderList(req.session.user.id).then((response) => {
      res.render("user/order", {
        response,
        users,
        user,
        count,
        wishcount,
        getDate,
      });
    });
  },

  getChangeNumber: async (req, res) => {
    let user = req.session.user.id;
    let users = req.session.user;

    res.render("user/change-number", { user, users, count, wishcount });
  },

  postChangeNumber: async (req, res) => {
    let data = req.body;

    let users = req.session.user;
    let userId = req.session.user.id;

    let userdata = await db.user
      .findOne({ _id: userId, phonenumber: data.oldNumber })
      .exec();

    if (userdata) {
      userhelpers.UpdateNumber(data, userId).then((result) => {
        res.redirect("/profile");
      });
    } else {
      res.render("user/change-number", {
        incorrectNum: true,
        count,
        wishcount,
        users,
        userId,
      });
    }
  },

  getViewAddress: async (req, res) => {
    let user = req.session.user.id;
    let users = req.session.user;
    let count = await cartAndWishlistHelpers.getCartCount(req.session.user.id);
    wishcount = await cartAndWishlistHelpers.getWishCount(req.session.user.id);
    shopHelpers.getAddress(req.session.user.id).then((response) => {
      let addressLength = response.length;
      res.render("user/view-address", {
        response,
        user,
        users,
        count,
        wishcount,
        addressLength,
      });
    });
  },

  deleteAddress: (req, res) => {
    shopHelpers.deleteAddress(req.body).then((response) => {
      res.json(response);
    });
  },

  getCancelOrder: (req, res) => {
    orderHelpers
      .cancelOrder(req.params.id, req.session.user.id)
      .then((response) => {
        res.json(response);
      });
  },

  getReturnOrder: async (req, res) => {
    await orderHelpers
      .returnOrder(req.params.id, req.session.user.id)
      .then(async (response) => {
        await orderHelpers.addToWallet(req.params.id);
        res.json(response);
      });
  },

  GetSuccessPage: (req, res) => {
    res.render("user/order_success", { count, wishcount });
  },

  applyCouponSuccess: (req, res) => {
    let code = req.query.code;
    shopHelpers.couponValidator(code, req.session.user.id).then((response) => {
      res.json(response);
    });
  },

  couponVerify: (req, res) => {
    let code = req.query.code;
    shopHelpers.couponVerify(code, req.session.user.id).then((response) => {
      res.json(response);
    });
  },

  applyCoupon: async (req, res) => {
    let code = req.query.code;
    let total = await orderHelpers.totalCheckOutAmount(req.session.user);
    shopHelpers.applyCoupon(code, total).then((response) => {
      let couponPrice = response.discountAmount ? response.discountAmount : 0;
      res.json(response);
    });
  },

  postVerifyPayment: (req, res) => {
    orderHelpers.verifyPayment(req.body).then(() => {
      orderHelpers
        .changePaymentStatus(req.session.user.id, req.body["order[receipt]"])
        .then(() => {
          res.json({ status: true });
        })
        .catch((err) => {
          res.json({ status: false, err });
        });
    });
  },

  orderDetails: async (req, res) => {
    let users = req.session.user;
    let details = req.query.order;
    const getDate = (date) => {
      let orderDate = new Date(date);
      let day = orderDate.getDate();
      let month = orderDate.getMonth() + 1;
      let year = orderDate.getFullYear();
      return `${isNaN(day) ? "00" : day}-${isNaN(month) ? "00" : month}-${
        isNaN(year) ? "0000" : year
      }`;
    };

    orderHelpers.viewOrderDetails(details).then(async (response) => {
      let products = response.products[0];
      let address = response.address;
      let orderDetails = response.details;

      let data = orderHelpers.createData(response);

      res.render("user/order-details", {
        products,
        address,
        orderDetails,
        users,
        data,
        count,
        wishcount,
        getDate,
      });
    });
  },
};
