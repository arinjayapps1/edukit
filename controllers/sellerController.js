const express = require("express");
const { Sequelize, DataTypes,Op } = require('sequelize');
const {
  body,validationResult
} = require("express-validator");
const Razorpay = require('razorpay');
const Payment = require('../models/payment');
const Location = require('../models/location');
const GST = require("../models/gst");
const USER = require("../models/user");
const Bank = require("../models/bank");
const zipcodes=require("../models/zipcode");
const https = require("https");
const zoho=require("../util/zoho");
const {
  listeners
} = require('process');
const bank = require('../models/bank');
const { AnalyticsExportDestination } = require("@aws-sdk/client-s3");
let gstinendpoint = "https://sheet.gstincheck.co.in/check/" + process.env.GSTIN_KEY;
var instance = new Razorpay({
  key_id: process.env.RAZOR_KEY,
  key_secret: process.env.RAZOR_SECRET
});

exports.getSellerAddress = async (req, res) => {
  let message=req.flash("message");
  let address=req.session.address;
  let states;
  let cities ;
  let zipcodes1;
  let addresses;

    try {
      addresses = await Location.findAll({
      where: {
        USER_ID: req.session.user.id
      }
    });
     states = await zipcodes.findAll({
      attributes: [
        [Sequelize.fn('DISTINCT', Sequelize.col('state')), 'state'],
        [Sequelize.col('state1'), 'state1']
      ]
    });
      cities = await zipcodes.findAll({
      attributes: [
        [Sequelize.fn('DISTINCT', Sequelize.col('city')), 'city'],[Sequelize.col('state1'), 'state1']
      ]
    });
      zipcodes1 = await zipcodes.findAll({
      attributes: [
        [Sequelize.fn('DISTINCT', Sequelize.col('pincode')), 'pincode'],[Sequelize.col('state1'), 'state1'],[Sequelize.col('city'), 'city']
      ]
    });
   
    if (message.length < 1) {
      message = null;
    }
    if (address) {
 
      req.session.address = null;
      await req.session.save();
      states =states.filter(c=>{
        return c.state1!=address.state1
      });
      cities=cities.filter(c=>{
        return c.city!=address.city && c.state1==address.state1
      });
      zipcodes1=zipcodes1.filter(c=>{
        return c.pincode!=address.pincode && c.state1==address.state1 && c.city==address.city
      });
      res.render('seller-address', {
        addresses: addresses,
        message: message,
        address: address,
        states: states,
        cities: cities,
        zipcodes: zipcodes1
      });
    } else {
      address = {
        firstname: null,
        lastname: null,
        mobile: null,
        address1: null,
        address2: null,
        state: null,
        city: null,
        zipcode: null
      };
      //console.log("addresses");
      //console.log(addresses);
      res.render('seller-address', {
        addresses: addresses,
        message: message,
        address: address,
        states: states,
        cities: cities,
        zipcodes: zipcodes1
      });
    };
  } catch (err) {
    req.flash("message",`unexpected Error:${err}`);
    message=req.flash("message");
    res.render('seller-address', {
      addresses: addresses,
      message: message,
      address: address,
      states: states,
      cities: cities,
      zipcodes: zipcodes1
    });
  }
};

exports.getEditSellerAddress = async (req, res) => {
  //console.log("req");
  //console.log(req)
  const addressid = req.params.detailid;
  let location;
  let message;
  let states;
  let cities;
  let zipcodes1;
  let address;
  try {
    location = await Location.findByPk(addressid);
    console.log("location");
    console.log(addressid);
    console.log(location);
    states = await zipcodes.findAll({
      attributes: [
        [Sequelize.fn('DISTINCT', Sequelize.col('state')), 'state'],
        [Sequelize.col('state1'), 'state1']
      ],
      where: {
        state1: location.state
      }
    });
    address = {
      firstname: location.firstname,
      firstnameStatus: 'is-valid',
      lastname: location.lastname,
      lastnameStatus: 'is-valid',
      mobile: location.mobile,
      mobileStatus: 'is-valid',
      address1: location.addressLine1,
      address1Status: 'is-valid',
      address2: location.addressLine2,
      address2Status: 'is-valid',
      state1: (states.length < 1) ? undefined : states[0].state1,
      state: (states.length < 1) ? undefined : states[0].state,
      stateStatus: 'is-valid',
      city: location.city,
      cityStatus: 'is-valid',
      zipcode: location.zipcode,
      zipcodeStatus: 'is-valid',
    };
    let result = await location.destroy();
    req.session.address = address;
    req.session.save(err => {
      res.redirect("/selleraddress");
    });

  } catch (err) {
    req.session.address = address;
    req.flash("message", `Unexpected Error in seller address due to:${err}`);
    req.session.save(err => {
      res.redirect("/selleraddress");
    });

  };

};

exports.getsellergst = async (req, res) => {
  let gstdetails;
  let message=req.flash("message");
  try{
    if (message.length < 1) {
      message = null;
    }
    gstdetails= await GST.findAll({where: {userId: req.session.user.id}});
    res.render('sellergst', {
      gstdetails: gstdetails,
      message:message
    });
  }
  catch(err){
    req.flash("message",`Unexpected error in sellergst: ${err}`);
    message=req.flash("message");
    res.render('sellergst', {
      gstdetails: gstdetails,
      message:message
    });
  }
  
};

exports.postSellerAddress = async (req, res) => {
  let i = 0;
  let errmsg = [];
  let firstname = req.body.firstname;
  let lastname = req.body.lastname;
  let city = req.body.city;
  let state = req.body.state;
  let mobile = req.body.mobile;
  let addressLine1 = req.body.address1;
  let addressLine2 = req.body.address2;
  let zipcode = req.body.zipcode;
  let userId = req.user.id;
  let location;
  let address;
  let states;
  try {
     states = await zipcodes.findAll({
      attributes: [
        [Sequelize.fn('DISTINCT', Sequelize.col('state')), 'state'],
        [Sequelize.col('state1'), 'state1']
      ],
      where:{
        state1:state
      }
    });
  
    address = {
      firstname: firstname,
      firstnameStatus: 'is-valid',
      lastname: lastname,
      lastnameStatus: 'is-valid',
      mobile: mobile,
      mobileStatus: 'is-valid',
      address1: addressLine1,
      address1Status: 'is-valid',
      address2: addressLine2,
      address2Status: 'is-valid',
      state1:(states.length<1)?undefined:states[0].state1,
      state: (states.length<1)?undefined:states[0].state,
      stateStatus: 'is-valid',
      city: city,
      cityStatus: 'is-valid',
      zipcode: zipcode,
      zipcodeStatus: 'is-valid',
    };

    const valresult = validationResult(req);
    if (!valresult.isEmpty()) {
      console.log(valresult);
      valresult.array().forEach(msg => {
        if (!errmsg.includes(msg.msg)) {
          errmsg[i] = msg.msg;
        }

        i++;
      });

      req.session.address = {
        firstname: firstname,
        firstnameStatus: valresult.array().find(e => e.param === 'firstname') ? 'is-invalid' : 'is-valid',
        lastname: lastname,
        lastnameStatus: valresult.array().find(e => e.param === 'lastname') ? 'is-invalid' : 'is-valid',
        mobile: mobile,
        mobileStatus: valresult.array().find(e => e.param === 'mobile') ? 'is-invalid' : 'is-valid',
        address1: addressLine1,
        address1Status: valresult.array().find(e => e.param === 'address1') ? 'is-invalid' : 'is-valid',
        address2: addressLine2,
        address2Status: valresult.array().find(e => e.param === 'address2') ? 'is-invalid' : 'is-valid',
        state1:(states.length<1)?undefined:states[0].state1,
        state: (states.length<1)?undefined:states[0].state,
        stateStatus: valresult.array().find(e => e.param === 'state') ? 'is-invalid' : 'is-valid',
        city: city,
        cityStatus: valresult.array().find(e => e.param === 'city') ? 'is-invalid' : 'is-valid',
        zipcode: zipcode,
        zipcodeStatus: valresult.array().find(e => e.param === 'zipcode') ? 'is-invalid' : 'is-valid',
      }
      req.flash("message", errmsg);
      req.session.save(err => {
        res.redirect("/selleraddress");
      });
    } else {
      let loc = await Location.create({
        firstname: firstname,
        lastname: lastname,
        country: "INDIA",
        city: city,
        state: state,
        addressLine1: addressLine1,
        addressLine2: addressLine2,
        zipcode: zipcode,
        locationType: "STORE",
        userType: req.session.user.role,
        userId: userId,
        mobile: mobile,
        status:'ACTIVE',
        primary:'Y'
      });
      //
      let user = await USER.findByPk(userId);
      user.STAGE = 2;
      //
      let result = await user.save();
      //
      res.redirect("/sellergst");
    }
  } catch (err) {
    req.session.address = address;
    req.flash("message", `Unexpected Error in seller address due to:${err}`);
    req.session.save(err => {
      res.redirect("/selleraddress");
    });

  }

};

exports.verifygst = (req, res) => {
  let gstin = req.params.gstin;
  console.log("inside verifygst")
  console.log(gstinendpoint);
  try {

    let gstinurl = gstinendpoint + "/" + gstin;
    console.log(gstinurl);
    https.get(gstinurl, (response) => {
      response.on("data", (data) => {
        //console.log(data);
        res.send(data);
      });
    });

  } catch (err) {
   console.log(`Unexpected error in verifygst: ${err}`);
  }
}

exports.postsellergst = async (req, res) => {
  let cname = req.body.cname;
  let btname = req.body.btname;
  let regdate = req.body.regdate;
  let status = req.body.UIN;
  let taxtype = req.body.taxtype;
  let ctb = req.body.ctb;
  let gstin = req.body.GSTIN;
  let message;
  try {

    let gst = await GST.create({
      gstin: gstin,
      cname: cname,
      btn: btname,
      regdate: regdate,
      status: status,
      ctb: ctb,
      taxtype: taxtype,
      userId: req.user.id

    });
    let user = await USER.findByPk(req.user.id);
    user.STAGE = 3;
    user.save().then(result => {
      res.redirect("/sellerBank");
    });

  } catch (err) {
    req.flash("message",`Unexpected error in sellergst:${err}`);
    req.session.save(err=>{
     res.redirect("/sellergst");
    });
    
  }
}

exports.getEditsellergst = (req, res) => {
  const gstDetailId = req.params.detailid;
  GST.findByPk(gstDetailId).then(
    gst => {
      gst.destroy().then(result => {
        res.redirect("/sellergst");
      }).catch(err => {
        console.log(`Error while deleting gst Detail due to error:${err}`);
      });
    }
  ).catch(err => {
    console.log(`Unexpected error in getEditsellergst: ${err}`);
  });
}

exports.getEditsellerbank = async (req, res) => {
  const bankId = req.params.detailid;
  let bankdetail1;
  let bank;
  try {
    bank = await Bank.findByPk(bankId);
    bank.status = "UNVERIFIED";
    bank.save().then(result => {
      res.redirect("/sellerbank");
    });
  } catch (err) {
    req.flash("message", `Unexpected Error in getsellerbank:${err}`);
    message = req.flash("message");
    res.render("sellerbank", {
      bankdetails: bank,
      message: message,
      bankdetail1: bankdetail1
    });
  }

}

exports.getsellerbank = async (req, res) => {
  let bankdetail;
  let bankdetail1;
  let bankdetails;
  let message = req.flash("message");
  try {
    bankdetails = await Bank.findAll({
      where: {
        userId: req.session.user.id
      }
    });

    if (message.length < 1) {
      message = null;
    }

    if (bankdetails.length < 1) {
      res.render("sellerbank", {
        bankdetails: bankdetails,
        message: message,
        bankdetail1: bankdetail1
      })
    } else {
      bankdetail = bankdetails[0];

      if (bankdetail.status == "UNVERIFIED") {
        bankdetails = [];
        bankdetail1 = bankdetail;
        //console.log(bankdetail1);
        bankdetail.destroy().then(result => {
          res.render("sellerbank", {
            bankdetails: bankdetails,
            message: message,
            bankdetail1: bankdetail1
          });
        });
      } else {
        res.render("sellerbank", {
          bankdetails: bankdetails,
          message: message,
          bankdetail1: bankdetail1
        });
      }
    }
  } catch (err) 
  {
    req.flash("message", `Unexpected Error in getsellerbank:${err}`);
    message = req.flash("message");
    res.render("sellerbank", {
      bankdetails: bankdetails,
      message: message,
      bankdetail1: bankdetail1
    });
  };
  
};

exports.postsellerbank = async (req, res) => {
  let acctname = req.body.acctname;
  let acctnum = req.body.acctnum;
  let ifsc = req.body.ifsc;
  let bankdata;
  let message;
  try {
    bankdata = await bank.create({
      AccountNum: acctnum,
      AccountName: acctname,
      IFSC: ifsc,
      userId: req.user.id,
      status: "UNVERIFIED"
    });
    res.redirect("/verifysellerbank");
  }
  catch(err){
      req.flash("message",`Error while saving Bank account details due to error:${err}`);
      req.session.save(err=>{
        res.redirect("/sellerbank");
      });
  }

}

exports.getverifysellerbank = async (req, res) => {
  let message = req.flash("message");
  let today = new Date();
  let mm = today.getMonth() + 1;
  let receiptId = "Receipt_" + req.session.user.id + "_" + today.getDate().toString() + mm.toString() + today.getFullYear().toString() + today.getHours().toString() + today.getMinutes().toString() + today.getSeconds().toString();
  var instance = new Razorpay({
    key_id: process.env.RAZOR_KEY,
    key_secret: process.env.RAZOR_SECRET
  });
  let options;
  let order;
  let payment;
  let bank;

  try {
    if (message.length < 1) {
      message = null;
    }
    bank = await Bank.findAll({where: {userId: req.user.id}});
    //
    if(bank.length<1){
      req.flash("message",`Please add bank details.`);
      req.session.save(err=>{
        res.redirect("/sellerbank");
      });
    }
    else{
      options = {
        amount: Math.round((1)) * 100, // amount in the smallest currency unit
        currency: "INR",
        receipt: receiptId,
        bank_account: {
          account_number: bank[0].AccountNum,
          name: bank[0].AccountName,
          ifsc: bank[0].IFSC
        }
      };
      order = await instance.orders.create(options);
      payment = await Payment.create({
        razorpayorderid:order.id,
        amount:Math.round((1)) * 100,
        userId:req.user.id,
        status:'ORDER_CREATED'
      });
      res.render("verifysellerbank", {
        order: order,
        message:message,
        key: process.env.RAZOR_KEY,
        razorAmt: 100,
        acctname: bank[0].AccountName,
        acctnum: bank[0].AccountNum,
        ifsc: bank[0].IFSC,
        acctid: bank[0].id
      });
    }
   
  } catch (err) {
    console.log(err);
    req.flash("message",`Error: ${err.error.description}`);
    message=req.flash("message");
    res.render("verifysellerbank", {
      order: order,
      message:message,
      key: process.env.RAZOR_KEY,
      razorAmt: 100,
      acctname: bank[0].AccountName,
      acctnum: bank[0].AccountNum,
      ifsc: bank[0].IFSC,
      acctid: bank[0].id
    });
  }

}

exports.postverifysellerbank = async (req, res) => {
  var crypto = require("crypto");
  var response = {
    "signatureIsValid": "false"
  }
  let body = req.body.razorpay_order_id + "|" + req.body.razorpay_payment_id;
  let bankid = req.body.acctid;
  let bank;
  let payments;
  let user;
  //console.log(req.body.acctid);
  try {
    var expectedSignature = crypto.createHmac('sha256', process.env.RAZOR_SECRET).update(body.toString()).digest('hex');
    if (expectedSignature=== req.body.razorpay_signature) {
      payments = await Payment.findAll({
        where: {
          razorpayorderid: req.body.razorpay_order_id
        }
      });
      payments[0].razorpaypaymentid = req.body.razorpay_payment_id;
      payments[0].status = "PAYMENT_CAPTURED";
      await payments[0].save();
      bank = await Bank.findByPk(bankid);
      bank.status = "VERIFIED";
      await bank.save();
      user = await USER.findByPk(req.user.id);
      user.STAGE = 4;
      user.save().then(result=>{
       res.redirect("/reviewseller");
      });


    } else {
      payments = await Payment.findAll({
        where: {
          razorpayorderid: req.body.razorpay_order_id
        }
      });
      payments[0].razorpaypaymentid = req.body.razorpay_payment_id;
      payments[0].status = "UNVERIFIED_RESPONSE";
      await payments[0].save();
      req.flash("message", "Unverified response");
      req.session.save(err => {
        res.redirect("/verifysellerbank");
      });
    }
  } catch (err) {
    req.flash("message", `Unexpected error:${err}`);
    req.session.save(err => {
      res.redirect("/verifysellerbank");
    });
  }
}

exports.getReviewSeller=async (req,res)=>{
  let message=req.flash("message");
  let locations;
  let bankdetails;
  let gstdetails;
  let errmsg=[];
  let i=0;
  if(message.length>0){
    errmsg[i]=message;
    i++;
  }
  try{
    locations = await Location.findAll({where:{
      [Op.and]:[{userId: req.session.user.id},{status:"ACTIVE"},{locationType:"STORE"}]
    }});
    bankdetails= await Bank.findAll({
      where: {
        [Op.and]:[{userId: req.session.user.id},{status:"VERIFIED"}]
      }
    });
    gstdetails=await GST.findAll({
      where: {
        userId: req.session.user.id
      }});
    if(locations.length<1){
      errmsg[i]=`Please provide Store details.`;
      i++;
    }
    if (bankdetails.length<1){
      errmsg[i]=`Please provide Bank details.`;
      i++;
    }  
    if(gstdetails.length<1){
      errmsg[i]=`Please provide GST details.`
      i++;
      
    }
    if(errmsg.length<1){
      errmsg=null;
    }
    res.render("reviewseller",{user:req.user,locations:locations,bankdetails:bankdetails,gstdetails:gstdetails,message:errmsg});
  }
  catch(err){
    errmsg[i]=`unexpected error:${err}`;
    //req.flash("message",`unexpected error:${err}`);
    //message=req.flash("message");
    res.render("reviewseller",{user:req.user,locations:locations,bankdetails:bankdetails,gstdetails:gstdetails,message:errmsg});
  }
}

exports.postReviewSeller = async (req, res) => {
  try {
    let seller = {
      "email": req.body.email,
      "mobile": req.body.mobile,
      "contactFirstName": req.body.contactFirstName,
      "contactLastName": req.body.contactLastName,
      "contactName": req.body.contactName,
      "addressLine1": req.body.addressLine1,
      "addressLine2": req.body.addressLine2,
      "city": req.body.city,
      "state": req.body.state,
      "zipcode": req.body.zipcode,
      "gst_treatment": "business_gst",
      "gstin": req.body.gstin,
      "companyName": req.body.companyName,
    }
    let vendor   = await zoho.createSeller(seller, res.locals.accesstoken, "vendor");
    console.log("vendor");
    console.log(vendor);
    if (vendor.code != 0) {
      throw vendor.message;
    }
    let customer = await zoho.createSeller(seller, res.locals.accesstoken, "customer");
    if (customer.code != 0) {
      throw customer.message;
    }
     let user = await USER.findByPk(req.user.id);
     let location = await Location.findByPk(req.body.locationId);
      user.STAGE = 5;
      user.zohovendorId=vendor.contact.contact_id;
      user.zohocustomerId=customer.contact.contact_id;
      location.zohocustbilltoaddressId=customer.contact.billing_address.address_id;
      location.zohocustshiptoaddressId=customer.contact.shipping_address.address_id;
      location.zohovendorbilltoaddressId=vendor.contact.billing_address.address_id;
      location.zohovendorshiptoaddressId=vendor.contact.shipping_address.address_id;
      await location.save();
      user.save().then(result => {
        req.session.sellerregistration = true;
        req.session.save(err=>{
          res.redirect("/confirmseller"); 
        });
        
      });
    
  } catch (err) {
    req.flash("message", "Please contact customer care.Unexpected error:" + err);
    req.session.save(err => {
      res.redirect("/reviewseller");
    });
  }
}

exports.getConfirmSeller=(req,res)=>{
  console.log(req.session.order);
  let sellerregistration = req.session.sellerregistration;
  //console.log(orders);
  if (!sellerregistration) {
    res.redirect('Error')
  } else {

    req.session.sellerregistration = null;
    res.render("confirmseller");
  }
}