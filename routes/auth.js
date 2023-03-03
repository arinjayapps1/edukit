const express = require("express");
const router = express.Router();
const Passport = require("passport");
const {
    check,body
} = require("express-validator");
const {
    validationResult
} = require("express-validator/check");
const authController = require("../controllers/auth");
const User = require("../models/user");
const isAuth = require("../middleware/isAuth");
const isAuth2 = require("../middleware/isauth2");
const zoho=require("../util/zoho");
require('../util/passport');


router.get("/auth/google",
    Passport.authenticate('google', {
        scope: ["profile", "email"]
    })
);
router.get("/auth/google/callback",
  Passport.authenticate('google', {
    failureRedirect: "/signin"
  }),
  async function (req, res) {
    let result1;
    let cart;
    let user;
    let seller;
    let result;
    try {
      //console.log('req.session'+req.session.passport.user);
      user = await User.findByPk(req.session.passport.user);
      req.session.user = user;
      req.session.isLoggedIn = true;
      res.locals.isAuthenticated = true;
      cart = await req.user.getCart();
      if (!cart) {
        await user.createCart();
      }
      req.session.save(err => {
        res.redirect("/");
      })

    } catch (err) {
      console.log(`Error in /auth/google/callback due to error:${err}`);
    }


  }
);


router.post('/signup', [
    body('email', 'Your email is not valid').not().isEmpty().isEmail(),
    body('last_name', 'Last Name cannot be empty and should be atleast 3 character').not().isEmpty().isString().isLength({
        min: 3
      }).trim(),
      body('first_name', 'First Name cannot be empty and should be atleast 3 character').not().isEmpty().isString().isLength({
        min: 3
      }).trim(),
      body('password', 'Password cannot be empty and should be atleast 6 character').not().isEmpty().isString().isLength({
        min: 6
      }).trim(),
      body('confirmpassword', 'Confirm Password cannot be empty and should be atleast 6 character').not().isEmpty().isString().isLength({
        min: 6
      }).trim(),
      body('mobile', 'Mobile cannot be empty and should be atleast 10 numbers').not().isEmpty().isNumeric().isLength({
        min: 10,max:10
      }).trim(),
      body('confirmpassword').custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Password confirmation does not match password');
        }
    
        // Indicates the success of this synchronous custom validator
        return true;
      }),
],authController.postSignupValidation,
Passport.authenticate('local-signup', {
    failureRedirect: "/signin",
    failureMessage: true
}), authController.postSignup);

//seller signup
router.post('/sellersignup',
[body('email', 'Your email is not valid').not().isEmpty().isEmail(),
 body('last_name', 'Last Name cannot be empty and should be atleast 3 character').not().isEmpty().isString().isLength({
    min: 3
  }).trim(),
 body('first_name', 'First Name cannot be empty and should be atleast 3 character').not().isEmpty().isString().isLength({
    min: 3
    }).trim(),
 body('password', 'Password cannot be empty and should be atleast 6 character').not().isEmpty().isString().isLength({
    min: 6
   }).trim(),
 body('confirmpassword', 'Confirm Password cannot be empty and should be atleast 6 character').not().isEmpty().isString().isLength({
    min: 6
   }).trim(),
 body('mobile', 'Mobile cannot be empty and should be atleast 10 numbers').not().isEmpty().isNumeric().isLength({
    min: 10,max:10
   }).trim(),
 body('confirmpassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Password confirmation does not match password');
    }
   // Indicates the success of this synchronous custom validator
    return true;
  }),
],authController.postSellerSignupValidation,
Passport.authenticate('local-signup', {
    failureRedirect: "/sellersignup",
    failureMessage: true
}), authController.postSellerSignup);



router.post("/signin", Passport.authenticate('local-signin', {
    failureRedirect: "/signin",
    failureMessage: true
}), authController.postSignin);

//router.get("/error-signin", authController.geterrorSignin);
//router.get("/seller-error-signin",authController.getSellerErrorSignin);
router.get("/signin",isAuth2, authController.getSignin);
router.get("/sellersignup",isAuth2, authController.getSellersignup);
router.get("/edit-signin", isAuth, authController.getEditSignin);
router.post("/edit-signin", isAuth, authController.postEditSignin);
router.post("/signout", authController.postLogout);


module.exports = router;