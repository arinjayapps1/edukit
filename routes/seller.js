const express = require("express");
const sellerController= require("../controllers/sellerController");
const {
    body,check
  } = require("express-validator");

const router = express.Router();
const isAuth  = require("../middleware/isAuth");
const isAuth1  = require("../middleware/isauth1");
const isBuyer=require("../middleware/isBuyer");

const csrf    = require("csurf");
var csrfProtection = csrf();

//controllers
router.get("/selleraddress",isAuth,isBuyer,sellerController.getSellerAddress);
router.post("/selleraddress",isAuth,isBuyer,[
    body('firstname', 'Contact First Name cannot be empty and should be atleast 3 character').not().isEmpty().isString().isLength({
    min: 3
  }).trim(),
  body('lastname', 'Contact Last Name cannot be empty and should be atleast 3 character').not().isEmpty().isString().isLength({
    min: 3
  }).trim(),
  body('mobile', 'Mobile Number cannot be empty and should be atleast 10 numbers').not().isEmpty().isNumeric().isLength({
    min: 10,max:10
   }).trim(),
   body('address1', 'Address1 cannot be empty and should be atleast 6 characters').not().isEmpty().isString().isLength({
    min: 6
   }).trim(),
   body('address2', 'Address2 cannot be empty and should be atleast 6 characters').not().isEmpty().isString().isLength({
    min: 6
   }).trim(),
   body('state').custom((value,{req})=>{
    if(value=='Choose state'){
      throw new Error('Please select valid state');
    }
    return true;
  }),
  body('city').custom((value,{req})=>{
    if(value=='Choose city'){
      throw new Error('Please select valid city');
    }
    return true;
  }),
  body('zipcode').custom((value,{req})=>{
    if(value=='Choose pincode'){
      throw new Error('Please select valid pincode');
    }
    return true;
  })
  
],
sellerController.postSellerAddress);
router.get("/sellergst",isAuth,isBuyer,sellerController.getsellergst);
router.get("/edit-sellergst/:detailid",isAuth,isBuyer,sellerController.getEditsellergst);
router.get("/edit-sellerbank/:detailid",isAuth,isBuyer,sellerController.getEditsellerbank);
router.get("/sellerbank",isAuth,isBuyer,sellerController.getsellerbank);
router.post("/sellerbank",isAuth,isBuyer,sellerController.postsellerbank);
router.post("/sellergst",isAuth,isBuyer,sellerController.postsellergst);
router.get("/verifygst/:gstin",isAuth,isBuyer,sellerController.verifygst);
router.get("/verifysellerbank",isAuth,isBuyer,sellerController.getverifysellerbank);
router.post("/verifysellerbank",isAuth,isBuyer,sellerController.postverifysellerbank);
router.get("/editSellerAddress/:detailid",isAuth,isBuyer,sellerController.getEditSellerAddress);
//router.post("/editSellerAddress",isAuth,isBuyer,sellerController.postEditSellerAddress);
router.get("/reviewseller",isAuth,isBuyer,sellerController.getReviewSeller);
router.post("/reviewseller",isAuth,isBuyer,sellerController.postReviewSeller);
router.get("/confirmseller",isAuth,sellerController.getConfirmSeller);



module.exports= router;