const Location = require('../models/location');

module.exports = async (req, res, next) => {
    let addressId = req.params.addressId;
    //console.log(req.session);
    //console.log("inside ischeckout.js");
    try {
        let locations = await Location.findAll({
            where: {
                LOCATION_ID: addressId
            }
        });
        if (locations.length < 1) {
            let message = req.flash("cartErr", "Please Add shipping address before payment.");
            req.session.save(err => {
                res.redirect("/cart");
            });
        }
        if (locations[0].userId !== req.session.user.id) {
            //console.log("inside unauthenticated");
            let message = req.flash("cartErr", "Not Authorized.Please add items to your Cart and Checkout to complete the order.");
            req.session.save(err => {
                res.redirect("/cart");
            });
        }
        let cart = await req.user.getCart();
        let products = await cart.getProducts();
        if (products.length < 1) {
            req.flash("cartErr", "Please add items to Cart before Checkout");
            req.session.save(err => {
                res.redirect("/cart");
            });
        }
        next();
    } catch (err) {
        console.log("Error in isCheckout due to error:" + err);
    }
}