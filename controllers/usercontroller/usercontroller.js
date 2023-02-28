const userhelpers = require("../../helpers/UserHelpers/UserHelpers");
const userproductHelpers = require("../../helpers/UserHelpers/userProduct");
const adminCategoryHelper = require("../../helpers/adminHelpers/adminCategoryHelper");

const otpLogin = require("../../OTP/otpLogin");
const client = require("twilio")(otpLogin.AccountSId, otpLogin.authtoken);
const user = require("../../models/connection");
const { log } = require("console");
const path = require('path');

let total, count;
module.exports = {
  // user home
  getHome: async (req, res) => {
    if (req.session.loggedIn) {
      let users = req.session.user;
      let count = await userhelpers.getCartCount(req.session.user.id);
      await userproductHelpers.shopListProduct().then((products) => {
        res.render("user/user", { users, count, products });
      });
    } else {
      let products = await userproductHelpers.shopListProduct();
      res.render("user/user", { products });
    }
  },
  // get user login
  getUserLogin: (req, res) => {
    if (req.session.loggedIn) {
      res.redirect("/");
    } else {
      res.render("user/user");
    }
  },
  // post user login
  postUserLogin: (req, res) => {
    userhelpers.doLogin(req.body).then((response) => {
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
    emailStatus = true;
    if (req.session.userloggedIn) {
      res.redirect("/login");
    } else {
      res.render("user/signup", { emailStatus });
    }
  },
  //post sign up
  postSignUp: (req, res) => {
    userhelpers.doSignUp(req.body).then((response) => {
      req.session.userloggedIn = true;

      var emailStatus = response.status;
      if (emailStatus == true) {
        res.redirect("/login");
      } else {
        res.render("user/signup", { emailStatus });
      }
    });
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

  getOtpLogin: (req, res) => {
    res.render("user/otpLogin");
  },

  postOtpLogin: async (req, res) => {
    mobilenumber = req.body.number;
    let users = await user.user.find({ phonenumber: mobilenumber }).exec();
    if (users == false) {
      res.render("user/otpLogin", { userExist: true });
    } else {
      client.verify.v2
        .services(otpLogin.serviceId)
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

  postVerify: (req, res) => {
    otpNumber = req.body.otp;
    client.verify.v2
      .services(otpLogin.serviceId)
      .verificationChecks.create({ to: `+91 ${mobilenumber}`, code: otpNumber })
      .then((verification_check) => {
        if (verification_check.status == "approved") {
          req.session.userloggedIn = true;

          userSession = req.session.userloggedIn;

          res.render("user/user", { userSession });
        } else {
          res.render("user/otpPage", { invalidOtp: true });
        }
      });
  },

  getProfilePage: async (req, res) => {
    let user = req.session.user.id;
    let users = req.session.user;
    let userDetails = await userhelpers.getUserDetails(req.session.user.id);
    let Details = userDetails[0].Address[0];
    console.log(Details);
    let count = await userhelpers.getCartCount(req.session.user.id);

    res.render("user/profilee", { profile: true, users, count, user, Details });
  },

  shopProduct: async (req, res) => {
    console.log(req.query.page);

    let pageNum = req.query.page;
    let perpage = 6;
    let users = req.session.user;
    let docCount = await userhelpers.getDocCount();
    let pages = Math.ceil(parseInt(docCount) / perpage);

    console.log(pageNum, "--", perpage, "--", docCount, "--", pages);

    let categories = await adminCategoryHelper.viewAddCategory();
    let count = await userhelpers.getCartCount(req.session.user.id);

    await userproductHelpers.shopListProducts(pageNum).then((response) => {
      res.render("user/shop", {
        response,
        count,
        users,
        categories,
        pageNum,
        pages,
      });
    });
  },

  getCategory: async (req, res) => {
    let users = req.session.user;

    let viewCategory = await adminCategoryHelper.viewAddCategory();

    userhelpers.category(req.query.cname).then((response) => {
      res.render("user/filter-by-category", {
        response,
        users,
        viewCategory,
        count,
      });
    });
  },

  imageZoom: async (req, res) => {
    let user = req.session.user.id;
    let users = req.session.user;
    let count = await userhelpers.getCartCount(req.session.user.id);
    userhelpers.imageZoom(req.params.id).then((image) => {
      res.render("user/imagezoom", { image, count, user, users });
    });
  },

  // get add-to-cart

  addToCart: async (req, res) => {
    userhelpers
      .addToCartItem(req.params.id, req.session.user.id)
      .then((response) => {
        res.json(response.status);
      });
  },

  //list cart  page

  listCart: async (req, res) => {
    let count = await userhelpers.getCartCount(req.session.user.id);
    let users = req.session.user;
    let userId = req.session.user;
    total = await userhelpers.totalCheckOutAmount(req.session.user.id);

    subtotal = await userhelpers.subtotal(req.session.user.id);

    userhelpers.listAddToCart(req.session.user.id).then((cartItems) => {
      res.render("user/cart", {
        cartItems,
        total,
        array: subtotal,
        userId,
        users,
        count,
      });
    });
  },

  getDeleteCart: (req, res) => {
    userproductHelpers.deleteCart(req.body).then((response) => {
      res.json(response);
    });
  },

  checkOutPage: async (req, res) => {
    let users = req.session.user.id;

    let cartItems = await userhelpers.listAddToCart(req.session.user.id);
    let total = await userhelpers.totalCheckOutAmount(req.session.user.id);

    userproductHelpers.checkOutpage(req.session.user.id).then((response) => {
      res.render("user/checkout", { users, cartItems, total, response });
    });
  },

  postcheckOutPage: async (req, res) => {
    let total = await userhelpers.totalCheckOutAmount(req.session.user.id);
    let order = await userproductHelpers
      .placeOrder(req.body, total)
      .then((response) => {
        if (req.body["payment-method"] == "COD") {
          res.json({ codstatus: true });
        } else {
          userproductHelpers
            .generateRazorpay(req.session.user.id, total)
            .then((order) => {
              res.json(order);
            });
        }
      });
  },

  getAddresspage: (req, res) => {
    let users = req.session.user;

    let user = req.session.user.id;
    res.render("user/add-address", { user, users });
  },

  postAddresspage: async (req, res) => {
    await userhelpers
      .postAddress(req.session.user.id, req.body)
      .then((data) => {
        res.redirect("/profile");
      });
  },

  postchangeProductQuantity: async (req, res) => {
    console.log(req.body, "--------------------------------");
    await userhelpers.changeProductQuantity(req.body).then(async (response) => {
      response.total = await userhelpers.totalCheckOutAmount(req.body.user);

      res.json(response);
    });
  },

  getOrderList: (req, res) => {
    let users = req.session.user;
    let user = req.session.user.id;

    userhelpers.getOrderList(req.session.user.id).then((response) => {
      res.render("user/order", { response, users, user });
    });
  },

  getChangeNumber: async (req, res) => {
    let user = req.session.user.id;
    let users = req.session.user;
    let count = await userhelpers.getCartCount(req.session.user.id);
    res.render("user/change-number", { user, users, count });
  },

  postChangeNumber: async (req, res) => {
    let data = req.body;

    let users = req.session.user;
    let userId = req.session.user.id;

    let userdata = await user.user
      .findOne({ _id: userId, phonenumber: data.oldNumber })
      .exec();

    if (userdata) {
      userhelpers.UpdateNumber(data, userId).then((result) => {
        res.redirect("/profile");
      });
    } else {
      res.render("user/change-number", { incorrectNum: true });
    }
  },

  getViewAddress: (req, res) => {
    let user = req.session.user.id;
    let users = req.session.user;
    userhelpers.getAddress(req.session.user.id).then((response) => {
      console.log(response);
      res.render("user/view-address", { response, user, users });
    });
  },

  deleteAddress: (req, res) => {
    userhelpers.deleteAddress(req.body).then((response) => {
      console.log(response);
      res.json(response);
    });
  },

  getCancelOrder: (req, res) => {
    let user = req.session.user.id;
    let users = req.session.user;
    userhelpers
      .cancelOrder(req.params.id, req.session.user.id)
      .then((response) => {
        res.json(response);
      });
  },

  getReturnOrder: (req, res) => {
    let user = req.session.user.id;
    let users = req.session.user;
    userhelpers
      .returnOrder(req.params.id, req.session.user.id)
      .then((response) => {
        res.json(response);
      });
  },

  GetSuccessPage: (req, res) => {
    res.render("user/order_success");
  },

  getLogout: (req, res) => {
    req.session.user = null;
    req.session.userloggedIn = false;
    res.render("user/login");
  },

  applyCoupon: async (req, res) => {
    let code = req.query.code;
    console.log(code);
    let total = await userhelpers.totalCheckOutAmount(req.session.user);
    userproductHelpers.applyCoupon(code, total).then((response) => {
      couponPrice = response.discountAmount ? response.discountAmount : 0;
      res.json(response);
    });
  },

  applyCouponSuccess: (req, res) => {
    let code = req.query.code;
    console.log(code, "code");
    userproductHelpers
      .couponValidator(code, req.session.user.id)
      .then((response) => {
        res.json(response);
      });
  },

  couponVerify: (req, res) => {
    let code = req.query.code;
    userproductHelpers
      .couponVerify(code, req.session.user.id)
      .then((response) => {
        res.json(response);
      });
  },

  postVerifyPayment: (req, res) => {
    
    userproductHelpers.verifyPayment(req.body).then(() => {
      

      userproductHelpers
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

    userproductHelpers.viewOrderDetails(details).then(async (response) => {

      let products = response.products[0];
      let address = response.address;
      let orderDetails = response.details;

      let data = await userproductHelpers.createData(response)


      res.render("user/order-details", {
        products,
        address,
        orderDetails,
        users,
        data
      });
    });
  },

  getInvoice:(req, res)=>
  {
    let orderId = req.params.id
    
    userproductHelpers.viewOrderDetails(orderId).then((result)=>
    {
      console.log(result);
     
    })
  }
};
 