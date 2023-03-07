const Location = require('../models/location');
const zipcodes = require('../models/zipcode');
const User = require("../models/user");
const { Sequelize, DataTypes } = require('sequelize');
const zoho=require("../util/zoho");
const {
  body,validationResult
} = require("express-validator");

exports.getAddress =async  (req, res) => {
  let states;
  let cities;
  let zipcodes1;
  let message=req.flash("message");
  let address=req.session.address;
  try {
    
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
    //console.log("address");
    //console.log(address);
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
    res.render('address', {
      message: message,
      address: address,
      states: states,
      cities: cities,
      zipcodes: zipcodes1
    });
  } else {
    address = {
      name: null,
      mobile: null,
      address1: null,
      address2: null,
      state: null,
      city: null,
      zipcode: null
    };
    //console.log("address");
   //console.log(address);
    res.render('address', {
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
  //console.log(message);
  res.render('address', {
    message: message,
    address: address,
    states: states,
    cities: cities,
    zipcodes: zipcodes1
  });
}
};
//
exports.getAddAddress = (req, res) => {
  res.render('add-address');
};

exports.getAddresses = (req, res) => {
  //console.log("Inside Adresses");
  Location.findAll({
    where: {
      USER_ID: req.session.user.id
    }
  }).then(
    addresses => {
      res.render('addresses', {
        addresses: addresses
      });
    }
  ).catch(err => {
    console.log(err);
  });

}

exports.postEditaddress = (req, res) => {
  console.log("location name:" + req.body.Name);
  const updatedName = req.body.Name;
  const updated_address1 = req.body.address1;
  const updated_address2 = req.body.address2;
  const city = req.body.city;
  const state = req.body.state;
  const locationId = req.body.locationId;
  const zipcode = req.body.zipcode
  Location.findByPk(locationId).then(
      location => {
        location.name = updatedName;
        location.city = city;
        location.state = state;
        location.zipcode = zipcode;
        location.addressLine1 = updated_address1;
        location.addressLine2 = updated_address2;
        return location.save();
      }).then(
      result => {
        res.redirect("/checkout-details");
      }
    )
    .catch(err => {
      console.log("Error while editing location:" + locationId + "with " + err);
    });

};

exports.postEditaddresses = (req, res) => {
  console.log("location name:" + req.body.Name);
  const updatedName = req.body.Name;
  const updated_address1 = req.body.address1;
  const updated_address2 = req.body.address2;
  const city = req.body.city;
  const state = req.body.state;
  const locationId = req.body.locationId;
  const zipcode = req.body.zipcode
  Location.findByPk(locationId).then(
      location => {
        location.name = updatedName;
        location.city = city;
        location.state = state;
        location.zipcode = zipcode;
        location.addressLine1 = updated_address1;
        location.addressLine2 = updated_address2;
        return location.save();
      }).then(
      result => {
        res.redirect("/addresses");
      }
    )
    .catch(err => {
      console.log("Error while editing location:" + locationId + "with " + err);
    });

};


exports.postAddress = async (req, res) => {
  //console.log("req.user");
  //console.log(req.user);
  let states;
  let address;
  let customer;
  let locationData;
  let user;
  let firstname = req.body.firstname;
  let lastname = req.body.lastname;
  let city = req.body.city;
  let state = req.body.state;
  let addressLine1 = req.body.address1;
  let addressLine2 = req.body.address2;
  let mobile = req.body.mobile;
  let zipcode = req.body.zipcode;
  let userId = req.user.id;
  let errmsg = [];
  let i = 0;
  let seller;
  try {
    states = await zipcodes.findAll({
      attributes: [
        [Sequelize.fn('DISTINCT', Sequelize.col('state')), 'state'],
        [Sequelize.col('state1'), 'state1']
      ],
      where: {
        state1: state
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
      state1: (states.length < 1) ? undefined : states[0].state1,
      state: (states.length < 1) ? undefined : states[0].state,
      stateStatus: 'is-valid',
      city: city,
      cityStatus: 'is-valid',
      zipcode: zipcode,
      zipcodeStatus: 'is-valid',
    };

    const valresult = validationResult(req);
    if (!valresult.isEmpty()) {
      //console.log(valresult);
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
        state1: (states.length < 1) ? undefined : states[0].state1,
        state: (states.length < 1) ? undefined : states[0].state,
        stateStatus: valresult.array().find(e => e.param === 'state') ? 'is-invalid' : 'is-valid',
        city: city,
        cityStatus: valresult.array().find(e => e.param === 'city') ? 'is-invalid' : 'is-valid',
        zipcode: zipcode,
        zipcodeStatus: valresult.array().find(e => e.param === 'zipcode') ? 'is-invalid' : 'is-valid',
      }
      req.flash("message", errmsg);
      req.session.save(err => {
        res.redirect("/address");
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
        locationType: "SHIP_TO",
        userType: req.session.user.role,
        userId: userId,
        mobile: mobile,
        status:'ACTIVE'
      });
      let locationcount = await Location.findAll({
        where: {
          USER_ID: req.user.id
        }
      });
      user     = await User.findByPk(req.user.id);
      if(locationcount.length<2){
         seller = {
          "email": req.user.email,
          "mobile": mobile,
          "contactFirstName": firstname,
          "contactLastName": lastname,
          "contactName": req.body.firstname + '' + req.body.lastname,
          "addressLine1": addressLine1,
          "addressLine2": addressLine2,
          "city": city,
          "state": state,
          "zipcode": zipcode,
          "gst_treatment": "business_none",
          "gstin": "",
          "companyName": req.body.firstname + ' ' + req.body.lastname,
        }
        customer = await zoho.createSeller(seller, res.locals.accesstoken, "customer");
        if(customer.code==0){
        user.zohocustomerId=customer.contact.contact_id;
        loc.zohocustbilltoaddressId=customer.contact.billing_address.address_id;
        loc.zohocustshiptoaddressId=customer.contact.shipping_address.address_id;
        await loc.save();
        user.save().then(result=>{
          res.redirect("/checkout");
        });
       }
       else{
        throw customer.message;
       }
      }else{
        locationData={
          "attention": req.body.firstname + '' + req.body.lastname,
          "address": addressLine1,
          "street2": addressLine2,
          "city": city,
          "state": state,
          "zip": zipcode,
          "country": "INDIA"
        };
        locresult = await zoho.createLocation(user.zohocustomerId, res.locals.accesstoken, locationData);
        console.log(locresult);
        if(locresult.code!==0){
          throw locresult.message;
          
          }else{
            res.redirect("/checkout");
         }
        
      }
      
    }
  } catch (err) {
    req.session.address = address;
    req.flash("message", `Unexpected Error in adding ship to address due to:${err}`);
    req.session.save(err => {
      res.redirect("/address");
    });

  }

};

exports.postAddAddress = (req, res) => {
  console.log("userType:" + req.user.userType);
  let name = req.body.Name;
  let city = req.body.city;
  let state = req.body.state;
  let addressLine1 = req.body.address1;
  let addressLine2 = req.body.address2;
  let zipcode = req.body.zipcode;
  let userId = req.user.id;
  console.log("User:" + req.session.user);

  Location.create({
    name: name,
    country: "INDIA",
    city: city,
    state: state,
    addressLine1: addressLine1,
    addressLine2: addressLine2,
    zipcode: zipcode,
    locationType: "SHIP_TO",
    userType: req.session.user.role,
    userId: userId
  }).then(loc => {
    console.log("location created.");
    res.redirect("/addresses");
  }).catch(err => {
    console.log("Error while Creation Address: " + err);
  });

};

exports.getEditAddress = (req, res) => {
  //console.log(req.isAuthenticated());
  //console.log(req.session.passport.user.id);
  const addressId = req.params.addressId;
  Location.findByPk(addressId).then(
    location => {
      res.render("edit-address", {
        location: location
      });
    }
  ).catch(err => {
    console.log("Error while fetching product on edit-product page for:" + productId + "with " + err);
  });

};

exports.getEditAddresses = (req, res) => {
  //console.log(req.isAuthenticated());
  //console.log(req.session.passport.user.id);
  const addressId = req.params.addressId;
  Location.findByPk(addressId).then(
    location => {
      res.render("edit-addresses", {
        location: location
      });
    }
  ).catch(err => {
    console.log("Error while fetching product on edit-product page for:" + productId + "with " + err);
  });

};

exports.getzipcodesbyapi = (req, res) => {
  zipcodes.findAll({
  }).then(
    pincodes => {
      res.status(200).json({
        "msg": "success",
        "pincodes": pincodes
      });


    }
  ).catch(
    err => {
      res.status(500).json({
        msg: "fail"
      });
      console.log(`Error while fetching all pincodes due to error:${err}`);
    }
  );

};