const express = require("express");
const shopController= require("../controllers/shop");
const addressController= require("../controllers/shop");
const router = express.Router();
const isAuth  = require("../middleware/isAuth");
const isAuth1  = require("../middleware/isauth1");
const isSeller  = require("../middleware/isSeller");
const isCheckout  = require("../middleware/IsCheckout");
const csrf    = require("csurf");
var csrfProtection = csrf();

router.get("/",isSeller,shopController.getShop);
/*cart routes*/
router.get("/cart",isAuth,isSeller,shopController.getCart);
router.post("/cart",isAuth,isSeller,shopController.postCart);
router.post("/addtoCart/:productId",isSeller,isAuth1,shopController.addtoCart);
router.post("/deleteCartItem",isAuth,isSeller,shopController.deleteCartItem);
/*checkout routes*/
router.get("/checkout",isAuth,isSeller,shopController.getCheckout);
router.post("/checkout",isAuth,isSeller,shopController.postCheckout);
/*payment routes*/
router.get("/payment/:addressId",isAuth,isSeller,isCheckout,shopController.getPayment);
router.post("/payment",isAuth,isSeller,shopController.postPayment);
router.get("/confirmOrder",isAuth,isSeller,shopController.confirmOrder);
router.get("/orders",isAuth,isSeller,shopController.getOrders);
//router.post("/paywithpaytmresponse",isAuth,shopController.paytmResponse);
//paytmResponse
//router.post("/address",isAuth,shopController.postAddress);
//router.get("/address",isAuth,shopController.getAddress);
//router.get("/edit-address/:addressId",isAuth,shopController.getEditAddress);
//router.post("/edit-address",isAuth,shopController.postEditaddress);
//router.get("/404",isAuth,shopController.getOrders);
router.get("/403",isAuth,shopController.get403);
router.get("/sales",isAuth,shopController.getsales);

module.exports= router;

