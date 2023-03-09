const { response } = require("../../app");
const adminHelper = require("../../helpers/adminHelpers/adminProductHelpers");
const orderHelper = require("../../helpers/adminHelpers/orderHelper");

let admins;

const adminCredential = {
  name: "superAdmin",
  email: "admin@gmail.com",
  password: "admin123",
};

module.exports = {
  // get login

  getAdminLogin: (req, res) => {
    admins = req.session.admin;
    if (req.session.adminloggedIn) {
      res.render("admin/admin-dashboard", { layout: "adminLayout", admins });
    } else {
      res.render("admin/login", { layout: "adminLayout" });
    }
  },

  postAdminLogin: (req, res) => {
    if (
      req.body.email == adminCredential.email &&
      req.body.password == adminCredential.password
    ) {
      req.session.adminloggedIn = true;

      req.session.admin = adminCredential;

      res.redirect("/admin");
    } else {
      res.render("admin/login", {
        layout: "adminLayout",
        adminloginErr: true,
        admins,
        invalid: true,
      });
    }
  },

  //get dashboard

  getDashboard: async (req, res) => {
    admins = req.session.admin;
    let totalProducts,
      days = [];
    let ordersPerDay = {};
    let paymentCount = [];

    await adminHelper.getAllProducts().then((Products) => {
      totalProducts = Products.length;
    });

    await orderHelper.getOrderByDate().then((response) => {
      const result = response[0].orders;
      for (let i = 0; i < result.length; i++) {
        let ans = {};
        ans["createdAt"] = result[i].createdAt;
        days.push(ans);
        ans = {};
      }

      days.forEach((order) => {
        const day = order.createdAt.toLocaleDateString("en-US", {
          weekday: "long",
        });
        ordersPerDay[day] = (ordersPerDay[day] || 0) + 1;
      });
    });

    let getCodCount = await adminHelper.getCodCount();

    let codCount = getCodCount.length;

    let getOnlineCount = await adminHelper.getOnlineCount();
    let onlineCount = getOnlineCount.length;

    paymentCount.push(onlineCount);
    paymentCount.push(codCount);

    await orderHelper.getAllOrders().then((response) => {
      var length = response.length;

      let total = 0;

      for (let i = 0; i < length; i++) {
        total += response[i].orders.totalPrice;
      }
      res.render("admin/admin-dashboard", {
        layout: "adminLayout",
        admins,
        length,
        total,
        totalProducts,
        ordersPerDay,
        paymentCount,
      });
    });
  },

  getAllOrderds: (req, res) => {
    admins = req.session.admin;

    orderHelper.getAllOrders().then((response) => {


      res.render("admin/all-orders", {
        layout: "adminLayout",
        response,
        admins,
      });
    });
  },

  getAddBanner: (req, res) => {
    admins = req.session.admin;

    res.render("admin/add-banner", { layout: "adminLayout", admins });
  },
  postAddBanner: (req, res) => {
    adminHelper.addBanner(req.body, req.file.filename).then((response) => {
      res.redirect("/admin/add_banner");
    });
  },

  //edit banner

  listBanner: (req, res) => {
    adminHelper.listBanner().then((response) => {
      let admins = req.session.admin;

      res.render("admin/list-banner", {
        layout: "adminLayout",
        response,
        admins,
      });
    });
  },

  //edit banner

  getEditBanner: (req, res) => {
    adminHelper.editBanner(req.query.banner).then((response) => {
      let admins = req.session.admin;

      res.render("admin/edit-banner", {
        layout: "adminLayout",
        response,
        admins,
      });
    });
  },

  // post edit banner

  postEditBanner: (req, res) => {
    adminHelper
      .postEditBanner(req.query.editbanner, req.body, req?.file?.filename)
      .then((response) => {
        res.redirect("/admin/list_banner");
      });
  },

  //admin logout

  getAdminLogOut: (req, res) => {
    req.session.adminloggedIn = false;
    admins = req.session.adminloggedIn;

    res.render("admin/login", { layout: "adminLayout", admins });
  },

  getSalesReport: async (req, res) => {
    let report = await adminHelper.getSalesReport();
    let Details = [];
    const getDate = (date) => {
      let orderDate = new Date(date);
      let day = orderDate.getDate();
      let month = orderDate.getMonth() + 1;
      let year = orderDate.getFullYear();
      return `${isNaN(day) ? "00" : day}-${isNaN(month) ? "00" : month}-${ isNaN(year) ? "0000" : year}`;
    };

    report.forEach((orders) => {
      Details.push(orders.orders);
    });

    console.log(Details[0].productsDetails[0]);
    res.render("admin/sales-report", {
      layout: "adminLayout",
      admins,
      Details,getDate
    });
  },

  postSalesReport: (req, res) => {
    let Details = [];

    adminHelper.postReport(req.body).then((orderdata) => {
      orderdata.forEach((orders) => {
        Details.push(orders.orders);
      });

      res.render("admin/sales-report", {
        layout: "adminLayout",
        admins,
        Details,
      });
    });
  },
};
