const orderHelper = require("../../helpers/adminHelpers/orderHelper");

module.exports =
{
    getOrderList:async (req, res)=>
    {
        console.log(req.params.id);
        let admins = req.session.admin;
        const getDate = (date) => {
            let orderDate = new Date(date);
            let day = orderDate.getDate();
            let month = orderDate.getMonth() + 1;
            let year = orderDate.getFullYear();
            return `${isNaN(day) ? "00" : day}-${isNaN(month) ? "00" : month}-${
              isNaN(year) ? "0000" : year
            }`;
          };
        await orderHelper.getOrderDetails(req.params.id).then((response)=>
        {
            let product = response.products;
            let address = response.address;
            let orderDetails = response.details
            console.log(response);
            res.render('admin/order-details',{ layout: "adminLayout", admins, product, address, orderDetails, getDate})
        }).catch((err)=>
        {
            console.log(err);
        })


    }
}