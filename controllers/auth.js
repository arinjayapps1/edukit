const express = require("express");
const User = require("../models/user");
const Category = require("../models/item-Category");
var bCrypt = require('bcrypt');
const zoho=require("../util/zoho");
const {
  validationResult
} = require("express-validator");


exports.postEditSignin = (req, res) => {
  const firstName = req.body.first_name;
  const lastName = req.body.last_name;
  const mobile = req.body.mobile;
  const email = req.body.email;
  const password = req.body.password;
  var generateHash = function (password) {
    return bCrypt.hashSync(password, bCrypt.genSaltSync(8), null);

  }
  var userPassword = generateHash(password);
  //console.log('req.session'+req.session.messages);
  //console.log(req.user);
  User.findByPk(req.session.passport.user).then(

    user => {
      user.firstName = firstName;
      user.lastName = lastName;
      user.MOBILE = mobile;
      user.PASSWORD = userPassword;
      user.save().then(
        saveuser => {
          res.redirect("/edit-signin");
        }
      ).catch(err => {
        console.log("Erroring while saving user in PostEditSIgnin: " + err);
      });
    }
  ).catch(err => {
    console.log("error while sign-in using local-signin strategy:" + err);
  });

};

exports.postSignup = async (req, res) => {
  let errmsg = [];
  let i = 0;
  let result1;
  let result;
  let cart;
  let user;
  let seller;
  try {
    user = await User.findByPk(req.session.passport.user);
    req.session.user = user;
    req.session.isLoggedIn = true;
    cart = await req.user.getCart();
    if (!cart) {
      //console.log("inside no cart");
      await user.createCart();
    }
    req.session.save(err=>{
      res.redirect("/");
    })
    
  } catch (err) {
    console.log(`Error in postSignup due to error:${err}`);
  }

};

exports.postSignupValidation = async (req, res, next) => {
  let errmsg = [];
  let i = 0;
  const result1 = validationResult(req);
  if (!result1.isEmpty()) {
    console.log("validation result")
    console.log(result1);
    result1.array().forEach(msg => {
      if (!errmsg.includes(msg.msg)) {
        errmsg[i] = msg.msg;
      }

      i++;
    });
    req.session.userdata = {
      email: req.body.email,
      emailStatus: result1.array().find(e => e.param === 'email') ? 'is-invalid' : 'is-valid',
      PASSWORD: req.body.password,
      passwordStatus: result1.array().find(e => e.param === 'password') ? 'is-invalid' : 'is-valid',
      firstName: req.body.first_name,
      firstNameStatus: result1.array().find(e => e.param === 'first_name') ? 'is-invalid' : 'is-valid',
      lastName: req.body.last_name,
      lastNameStatus: result1.array().find(e => e.param === 'last_name') ? 'is-invalid' : 'is-valid',
      MOBILE: req.body.mobile,
      mobileStatus: result1.array().find(e => e.param === 'mobile') ? 'is-invalid' : 'is-valid',
      confirmpassword: req.body.confirmpassword,
      confirmpasswordStatus: result1.array().find(e => e.param === 'confirmpassword') ? 'is-invalid' : 'is-valid',
    };
    req.flash("loginError", errmsg);
    req.session.save(err => {
      res.redirect("/signin")
    });

  } else {
    next();
  }
}

exports.postSellerSignupValidation = async (req, res, next) => {
  let errmsg = [];
  let i = 0;
  const result1 = validationResult(req);
  if (!result1.isEmpty()) {
    console.log("validation result")
    console.log(result1);
    result1.array().forEach(msg => {
      if (!errmsg.includes(msg.msg)) {
        errmsg[i] = msg.msg;
      }

      i++;
    });
    req.session.userdata = {
      email: req.body.email,
      emailStatus: result1.array().find(e => e.param === 'email') ? 'is-invalid' : 'is-valid',
      PASSWORD: req.body.password,
      passwordStatus: result1.array().find(e => e.param === 'password') ? 'is-invalid' : 'is-valid',
      firstName: req.body.first_name,
      firstNameStatus: result1.array().find(e => e.param === 'first_name') ? 'is-invalid' : 'is-valid',
      lastName: req.body.last_name,
      lastNameStatus: result1.array().find(e => e.param === 'last_name') ? 'is-invalid' : 'is-valid',
      MOBILE: req.body.mobile,
      mobileStatus: result1.array().find(e => e.param === 'mobile') ? 'is-invalid' : 'is-valid',
      confirmpassword: req.body.confirmpassword,
      confirmpasswordStatus: result1.array().find(e => e.param === 'confirmpassword') ? 'is-invalid' : 'is-valid',
    };
    req.flash("loginError", errmsg);
    req.session.save(err => {
      res.redirect("/sellersignup")
    });

  } else {
    next();
  }
}

//seller signup
exports.postSellerSignup = async (req, res) => {
  let user;
  let result;
  let cart;
  try{
    user = await User.findByPk(req.session.passport.user);
    req.session.user = user;
    req.session.isLoggedIn = true;
    user.role  ="SELLER";
    user.STAGE=1;
    result = await user.save();
    cart   = await req.user.getCart();
    if (!cart) {
      user.createCart();
    }
    req.session.save(err => {
      res.redirect("/selleraddress");
    });
  }
  catch(err){
    console.log(`Unexpected error in postSellerSignup : ${err}`);
  }
};

exports.getEditSignin = (req, res) => {

  User.findByPk(req.session.passport.user).then(
    user => {
      res.render("edit-signin", {
        user: user
      });
    }
  ).catch(err => {
    console.log(err);
  });

};

exports.getSignin = async (req, res) => {
  //console.log(req);
  //console.log("session msg:"+req.flash("loginMessage"));
  var message = req.flash('loginError');
  let userdata=req.session.userdata;
  let userdata1;
  
  

  if (!req.session.isLoggedIn) {
    isauth = false;
  } else {
    isauth = true;
  }
  if(userdata){
    req.session.userdata=null;
    await req.session.save();
    userdata1= {
      email: userdata.email,
      emailStatus:userdata.emailStatus,
      PASSWORD: userdata.PASSWORD,
      passwordStatus:userdata.passwordStatus,
      firstName: userdata.firstName,
      firstNameStatus:userdata.firstNameStatus,
      lastName: userdata.lastName,
      lastNameStatus:userdata.lastNameStatus,
      MOBILE: userdata.MOBILE,
      mobileStatus:userdata.mobileStatus,
      confirmpassword:userdata.confirmpassword,
      confirmpasswordStatus:userdata.confirmpasswordStatus
    }
  }
  else{
    userdata1= {
      email: null,
      emailStatus:null,
      PASSWORD: null,
      passwordStatus:null,
      firstName: null,
      firstNameStatus:null,
      lastName: null,
      lastNameStatus:null,
      MOBILE: null,
      mobileStatus:null,
      confirmpassword:null,
      confirmpasswordStatus:null
    }
  }
  //if (req.session.messages) {
    //if (req.session.messages.length > 0) {
      if(message.length>0){
      //message = req.session.messages[req.session.messages.length - 1];
      //req.session.messages = null;
      res.render("signin", {
        message: message,
        isAuthenticated: isauth,
        userdata1:userdata1
        //categories: fetchedCategories
      });
    }
   else {
    message=null;
    res.render("signin", {
      message: message,
      //categories: fetchedCategories,
      isAuthenticated: isauth,
      userdata1:userdata1
    });
  }
  //res.render("signin",{isAuthenticated:isauth,message:req.flash("loginMessage")});

};
//
exports.getSellersignup = async (req, res) => {
  //console.log(req);
  console.log("inside getSellersignup");
  //console.log("session msg:"+req.flash("loginMessage"))
  var message = req.flash('loginError');
  let userdata=req.session.userdata;
  let userdata1;
  
  if (!req.session.isLoggedIn) {
    isauth = false;
  } else {
    isauth = true;
  }
  if(userdata){
    req.session.userdata=null;
    await req.session.save();
    userdata1= {
      email: userdata.email,
      emailStatus:userdata.emailStatus,
      PASSWORD: userdata.PASSWORD,
      passwordStatus:userdata.passwordStatus,
      firstName: userdata.firstName,
      firstNameStatus:userdata.firstNameStatus,
      lastName: userdata.lastName,
      lastNameStatus:userdata.lastNameStatus,
      MOBILE: userdata.MOBILE,
      mobileStatus:userdata.mobileStatus,
      confirmpassword:userdata.confirmpassword,
      confirmpasswordStatus:userdata.confirmpasswordStatus
    }
  }
  else{
    userdata1= {
      email: null,
      emailStatus:null,
      PASSWORD: null,
      passwordStatus:null,
      firstName: null,
      firstNameStatus:null,
      lastName: null,
      lastNameStatus:null,
      MOBILE: null,
      mobileStatus:null,
      confirmpassword:null,
      confirmpasswordStatus:null
    }
  }

  
    if (message.length > 0) {
      //message = req.session.messages[req.session.messages.length - 1];
      //req.session.messages = null;
      res.render("sellersignup", {
        message: message,
        isAuthenticated: isauth,
        userdata1:userdata1
        //categories: fetchedCategories
      });
    }
   else {
    message=null;
    res.render("sellersignup", {
      message: message,
      //categories: fetchedCategories,
      isAuthenticated: isauth,
      userdata1:userdata1
    });
  }
  //res.render("signin",{isAuthenticated:isauth,message:req.flash("loginMessage")});

};


exports.postSignin = async (req, res) => {
  //console.log("inside Post sign in:" +req.session.passport.user);
  const email = req.body.email;
  const password = req.body.password;
  let  userdoc;
  try{
    userdoc= await User.findOne({where: {email: email}});
    if (!userdoc) {
      //console.log('user doesnot exist');
      res.redirect("/signin");
    } else{
      req.session.user = userdoc;
      req.session.isLoggedIn = true;
      req.session.save(err=>{
        res.redirect("/");
      });
          
    }
  }
  catch(err){
    console.log(`unexpected error in postSignin: due to error:${err}`);
  }
};


exports.postLogout = (req, res) => {
  //req.logout();
  req.session.destroy(err => {
    //console.log("Error while destroying session:"+ err)
    res.redirect("/");
  });
};
