const express = require("express");
const {
    body,check
  } = require("express-validator");

//const shopController= require("../controllers/shop");
const addressController= require("../controllers/address");
const router = express.Router();
const isAuth  = require("../middleware/isAuth");
const csrf    = require("csurf");
var csrfProtection = csrf();

router.post("/address",isAuth,[
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
  
],addressController.postAddress);
//router.post("/add-address",isAuth,addressController.postAddAddress);
//router.get("/add-address",isAuth,addressController.getAddAddress);
router.get("/addresses",isAuth,addressController.getAddresses);
router.get("/address",isAuth,addressController.getAddress);
//router.get("/edit-address/:addressId",isAuth,addressController.getEditAddress);
//router.get("/edit-addresses/:addressId",isAuth,addressController.getEditAddresses);
//router.post("/edit-address",isAuth,addressController.postEditaddress);
//router.post("/edit-addresses",isAuth,addressController.postEditaddresses);
router.get("/getzipcodes",isAuth,addressController.getzipcodesbyapi);


module.exports= router;
