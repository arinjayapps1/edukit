const Razorpay = require('razorpay');
const shortid = require('shortid');
const unique = require('uniqueid');
//const { QueryTypes } = require('@sequelize/core');
const https = require("https");
const sequelize = require('../util/database');
const zoho = require("../util/zoho");

const Product = require('../models/product');
const User = require('../models/user');
const GST = require("../models/gst");
const orderLine = require('../models/order-item');
const Order = require("../models/order");
const Location = require('../models/location');
let status;
const {
  QueryTypes,Op
} = require('sequelize');
const {
  nextTick
} = require('process');
const invUrl = "https://books.zoho.in/api/v3/invoices?organization_id=" + process.env.ZOHO_ORG_ID;

var instance = new Razorpay({
  key_id: process.env.RAZOR_KEY,
  key_secret: process.env.RAZOR_SECRET
});


const getCartProducts = async (cart, vendor) => {
  let products = await cart.getProducts({
    where: {
      USER_ID: vendor.vendorId
    }
  });
  //console.log(products);
  return products;
}

exports.getOrders = async (req, res) => {
  let date = new Date();
  let totalItems;
  let page;
  let orderCnt;
  let orders;
  let products=[];
  let lastPage;
  let nextPage;
  let previousPage;
  let i=0;
  let message=req.flash("message");
  let items_per_page = 6;
  let options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };

  try{
    if (message.length < 1) {
      message = null;
    }
    if (!req.query.page) {
      page = 1;
    } else {
      page = +req.query.page;
    }
    orderCnt = await Order.count({where: {USER_ID: req.session.user.id}});
    totalItems = orderCnt;
    lastPage = Math.ceil(totalItems / items_per_page);
    previousPage = page - 1;
    nextPage=page+1;
    if (nextPage > lastPage) 
    {
      nextPage = lastPage;
    }
    if (previousPage < 1)
    {
      previousPage = 1;
    }
    orders = await req.user.getOrders({limit: items_per_page,
                                      offset: (page - 1) * items_per_page
                                     });
    //
    console.log("orders");
    console.log(orders);
    for (let j=0;j<orders.length;j++){
      let order = orders[j];
      let orderProducts = await order.getProducts();
      orderProducts.forEach(p=>{
        products[i]={
          orderId:p.orderitem.orderId,
          pname:p.name,
          imageurl:p.imageUrl,
          price:p.orderitem.itemPrice,
          qty:p.orderitem.quantity
        }
        i++;
      });
    }                          
    res.render("orders", {orders: orders,
                          message:message,
                          products:products,
                          options: options,
                          totalItems: totalItems,
                          currentPage: page,
                          hasNextPage: items_per_page * page < totalItems,
                          hasPreviousPage: page > 1,
                          nextPage: nextPage,
                          previousPage: previousPage,
                          lastPage: Math.ceil(totalItems / items_per_page)
                        });                                 

  }catch(err){
    console.log(err);
   req.flash("message",`Unexpected Error:${err}`);
   message=req.flash("message");
   res.render("orders", {orders: orders,
    message:message,
    products:products,
    options: options,
    totalItems: totalItems,
    currentPage: page,
    hasNextPage: items_per_page * page < totalItems,
    hasPreviousPage: page > 1,
    nextPage: nextPage,
    previousPage: previousPage,
    lastPage: Math.ceil(totalItems / items_per_page)
  });     
  }
  

  

}

exports.confirmOrder = (req, res) => {
  console.log(req.session.order);
  let orders = req.session.order;
  //console.log(orders);
  if (!orders) {
    res.redirect('Error')
  } else {
    console.log(req.user.cart);
    req.session.order = null;
    res.render("confirm-order", {
      orders: orders
    });
  }


};

exports.getShop = async (req, res) => {
  //console.log("inside get /:"+ req.session.user.email);
  //console.log("inside get /:"+ req.isAuthenticated() );
  let isauth;
  let cart;
  if (!req.session.isLoggedIn) {
    isauth = false;
  } else {
    isauth = true;
  }
  

  //finding products
  Product.findAll({where:{
    status:'active'
  }}).then(
    products => {
      res.render('index3', {
        products: products,
        isAuthenticated: isauth
      });

    }
  ).catch(
    err => {
      console.log("Error while fetching all products in root page due to error:" + err);
    }
  );

};



exports.postPayment = async (req, res) => {

  var crypto = require("crypto");

  var response = {
    "signatureIsValid": "false"
  }
  let stage = 1;
  let neworder;
  let cart;
  let orders = [];
  let invoices=[];
  let result;
  let shippingcharge=100;
  
  //let i = 0;
  var partialcart;
  let addressId=req.body.addressId;
  let destinationState;
  let sourceState;
  let gstdetails;
  let body = req.body.razorpay_order_id + "|" + req.body.razorpay_payment_id;
  let checkAmt=req.body.totalAmount;
  var expectedSignature = crypto.createHmac('sha256', process.env.RAZOR_SECRET).update(body.toString()).digest('hex');
  //
  if (expectedSignature === req.body.razorpay_signature) {
    try {
      cart = await req.user.getCart();
      stage = 2;
      let vendors = await sequelize.query('SELECT  DISTINCT `product`.`USER_ID` AS `vendorId`,`fnduser`.`ZOHO_VENDOR_ID` zohoVendorId FROM `XX_ITEMS` AS `product` INNER JOIN `XX_USER_CART_ITEMS` AS `cartItem` ON `product`.`ITEM_ID` = `cartItem`.`ITEM_ID` INNER JOIN `XX_FND_USERS` AS `fnduser` ON `fnduser`.`USER_ID`=`product`.`USER_ID`  AND `cartItem`.`CART_ID` = ?', {
        replacements: [cart.id],
        type: QueryTypes.SELECT
      });
      destinationState= process.env.ZOHO_STATE;
      //await Location.findByPk(addressId);
      
      //
      for (let i = 0; i < vendors.length; i++) {
        let orderAmt=0;
        let subtotal=0;
        let tax=0;
        gstdetails= await GST.findAll({where: {
          [Op.and]:[{userId: vendors[i].vendorId},{status:"ACTIVE"}]
        }});
        sourceState=await Location.findAll({where:{
          [Op.and]:[{userId: vendors[i].vendorId},{status:"ACTIVE"},{locationType:"STORE"}]
         }});

        if (i != 0) {
          shippingcharge = 0;
        }
        let products = await getCartProducts(cart, vendors[i]);
        console.log(products);
        products.forEach(p=>{
          subtotal+=p.cartItem.quantity*p.cartItem.itemPrice;
          tax+=(p.cartItem.quantity*p.cartItem.itemPrice*p.taxPercent)/100;

        })
        let order = await req.user.createOrder({
          vendorId: vendors[i].vendorId,
          zohoVendorId: vendors[i].zohoVendorId,
          zohoCustomerId: req.user.zohocustomerId,
          billToLocationId: addressId,
          shipToLocationId: addressId,
          subtotalAmt:subtotal,
          destinationState:destinationState.state,
          gstin:gstdetails[0].gstin,
          sourceState:sourceState[0].state,
          taxAmt:tax,
          shipping:shippingcharge,
          totalAmt:subtotal+tax+shippingcharge,
          status: "CREATED"
        });

        let result = await order.addProduct(products.map(product => {
          product.orderitem = {
            quantity: product.cartItem.quantity,
            itemPrice: product.cartItem.itemPrice,
            zohoItemId: product.cartItem.zohoItemId,
            zohoIntraTaxId:product.zohoIntraTaxId,
            zohoInterTaxId:product.zohoInterTaxId,
            itemCostPrice:product.costPrice
          }
          console.log(product);
          return product;
        }));

        orders[i] = order;
        let invresult = await zoho.createInvoice(order, shippingcharge, res.locals.accesstoken);

        if (invresult.code != 0) {
          throw invresult.message;
        } else {
          invoices[i] = invresult;
        }
        let billresult= await zoho.createBill(order,res.locals.accesstoken);
        if (billresult.code != 0) {
          throw billresult.message;
        }
      }
      result = await zoho.createPayment(invoices, req.body.razorpay_payment_id, checkAmt, res.locals.accesstoken);

      if (result.code != 0) {
        throw result.message;
      }

      req.session.order = orders;
      req.session.save((err) => {
        cart.setProducts(null).then((result) => {
          res.redirect("/confirmOrder");
        });

      });


    } catch (err) {
      req.flash("PaymenterrMsg", "Please contact customer care.Unexpected error:" + err);
      req.session.save(err => {
        res.redirect("/payment/" + addressId);
      });
    }

  }
  //else{
    //console.log()
  //}
  

};

exports.getPayment = async (req, res) => {
  let cartAmount = 0;
  let shippingAmount = 100;
  let totalAmount = 0;
  let taxAmt = 0;
  let discAmt = 0;
  let today = new Date();
  let addressId = req.params.addressId;
  let addresses;
  let mm = today.getMonth() + 1;
  //console.log(req.session);
  //let message = req.flash('shipAdderr');
  let message=req.flash("PaymenterrMsg");
  try{
    let receiptId = "Receipt_" + req.session.user.id + "_" + today.getDate().toString() + mm.toString() + today.getFullYear().toString() + today.getHours().toString() + today.getMinutes().toString() + today.getSeconds().toString();
    if (message.length < 1) {
      message = null;
    }
    let cart     = await req.user.getCart();
    let products = await cart.getProducts();
    products.forEach(p => {
      if (p.origPrice<p.discPrice){
        cartAmount += p.cartItem.quantity * p.discPrice;  
      }
      else{
        cartAmount += p.cartItem.quantity * p.origPrice;
      }
      //cartAmount += p.cartItem.quantity * p.discPrice;
      taxAmt += p.cartItem.quantity * p.taxAmt;
      if(p.discPrice>p.origPrice){
        discAmt += p.cartItem.quantity * 0;
      }
      else{
        discAmt += p.cartItem.quantity * (p.origPrice - p.discPrice);
      }
      
    });
    totalAmount = Math.ceil((cartAmount + shippingAmount + taxAmt-discAmt));
    razorAmt = totalAmount * 100;
    addresses=await Location.findAll({
      where: {
        LOCATION_ID: addressId
      }
    });
    if (addresses.length < 1) {
      if (message) {
        message = "Please Add shipping address before check out."
      }
    }
    var options = {
      amount: Math.round((totalAmount)) * 100, // amount in the smallest currency unit
      currency: "INR",
      receipt: receiptId
    };
    instance.orders.create(options, function (err, order) {
      console.log(err);
      res.render('payment', {
        order: order,
        key: process.env.RAZOR_KEY,
        razorAmt: razorAmt,
        addresses: addresses,
        products: products,
        discAmt: discAmt,
        taxAmt: taxAmt,
        totalAmount: totalAmount,
        shippingAmount: shippingAmount,
        cartAmount: cartAmount,
        addressId:addressId,
        message: message
      });
    });
  }
  catch(err){
    console.log("Error in Getting Payment page due to error:"+err);
  }

  
}

exports.postCheckout = async (req, res) => {
  let cartAmount = 0;
  let shippingAmount = 100;
  let totalAmount = 0;
  let taxAmt = 0;
  let discAmt = 0;
  let addresses;
  //console.log(req.body.shipaddress);
  let message = req.flash('message');
  try{
    if (req.body.shipaddress) {
      res.redirect("/payment/" + req.body.shipaddress);
  
    } else {
       addresses = await Location.findAll({where: {USER_ID: req.session.user.id}});
       if (addresses.length < 1) {
        req.flash('message', 'Please Add shipping address before payment.');

      } else {
        req.flash('message', 'No shipping address selected.');
      }
      req.session.save(err => {
        res.redirect("/checkout");
      });
    }
  }
  catch(err){
   req.flash("message",`Unexpected error on checkout page:${err}`);
   req.session.save(err => {
    res.redirect("/checkout");
  });
  }

};

exports.getCheckout = async(req, res) => {
  let cartAmount = 0;
  let shippingAmount = 100;
  let totalAmount = 0;
  let taxAmt = 0;
  let discAmt = 0;
  let products;
  let cart ;
  let addresses;
  // console.log(req.session);
  let message = req.flash('message');
  if (message.length < 1) {
    message = null;
  }
  try {
     addresses = await Location.findAll({
      where: {
        USER_ID: req.session.user.id
      }
    });
    cart = await req.user.getCart();
    products = await cart.getProducts();
    if(products.length<1){
      req.flash("cartErr", "Please add items to Cart before Checkout");
      req.session.save(err => {
        res.redirect("/cart");
      });
    }
    else{
      products.forEach(p => {
        if (p.origPrice<p.discPrice){
          cartAmount += p.cartItem.quantity * p.discPrice;  
        }
        else{
          cartAmount += p.cartItem.quantity * p.origPrice;
        }
        
        taxAmt += p.cartItem.quantity * p.taxAmt;
        if(p.discPrice>p.origPrice){
          discAmt += p.cartItem.quantity *0  
        }
        else{
        discAmt += p.cartItem.quantity * (p.origPrice - p.discPrice);
      }
      });
      
      //console.log(`cartAmount:${cartAmount}`);
      //console.log(`taxAmt:${taxAmt}`);
      //console.log(`discAmt:${discAmt}`);
      //console.log(`shippingAmount:${shippingAmount}`);
      totalAmount = Math.ceil((cartAmount + shippingAmount + taxAmt) - discAmt);
      console.log(`totalAmount:${totalAmount}`);
      res.render('checkout', {
        addresses: addresses,
        products: products,
        discAmt: discAmt,
        taxAmt: taxAmt,
        totalAmount: totalAmount,
        shippingAmount: shippingAmount,
        cartAmount: cartAmount,
        message: message
      });
    }
    
    
  }
  catch(err){
    req.flash("message", `Unexpected error on cart page:${err}`);
    message=req.flash("message");
    
      res.render("checkout",{
        addresses: addresses,
        products: products,
        discAmt: discAmt,
        taxAmt: taxAmt,
        totalAmount: totalAmount,
        shippingAmount: shippingAmount,
        cartAmount: cartAmount,
        message: message
      });
    
  }
};

exports.getCart = (req, res) => {

  let message = req.flash('cartErr');
  if (message.length < 1) {
    message = null;
  }
  //console.log(req.user);
  let cartAmount = 0;
  req.user.getCart().then(cart => {
    return cart.getProducts();
  }).then(products => {
    products.forEach(p => {
      //console.log('quantity:' + p.cartItem.quantity)
      cartAmount += p.cartItem.quantity * p.discPrice;
    });
    res.render('cart', {
      products: products,
      cartAmount: cartAmount,
      message: message
    });

  }).catch(err => {
    console.log("Error in getCart controller:" + err);
  });
};

exports.deleteCartItem = (req, res) => {
  let productId = req.body.prodId;
  let product;
  req.user.getCart().then(
      cart => {
        return cart.getProducts({
          where: {
            ITEM_ID: productId
          }
        })
      })
    .then(products => {
      if (products.length > 0) {
        product = products[0];
        product.cartItem.destroy().then(result => {
          res.redirect("/cart");
        });
      }
    })
    .catch(err => {
      console.log("Error in Deleting Cart:" + err);
    });

}

exports.postCart = (req, res) => {

  req.user.getCart().then(
    cart => {
      return cart.getProducts();
    }
  ).then(
    products => {
      if (products.length < 1) {
        req.flash("cartErr", "Please add items to Cart before Checkout");
        req.session.save(err => {
          res.redirect("/cart");
        });

      } else {
        res.redirect("/Checkout");
      }
    }
  ).catch(
    err => {
      console.log("Error in PostCart route due to error:" + err);
    }
  )
}

exports.addtoCart = async (req, res, next) => {

  //console.log(req.body.productId);
  const productId = req.params.productId;
  let cartitems;
  let fetchedCart;
  let product;
  let newQuantity = 1;
  //console.log("getting Cart:" +req.user.getCart());

  try {
    let newCart = await req.user.getCart();
//    fetchedCart = newCart;
    let products = await newCart.getProducts({
      where: {
        ITEM_ID: productId
      }
    });
    if (products.length > 0) {
      product = products[0];
    }
    if (product) {
      const oldQty = product.cartItem.quantity;
      newQuantity = oldQty + 1;
    } else {
      product = await Product.findByPk(productId);
    }

    let result = await newCart.addProduct(product, {
      through: {
        quantity: newQuantity,
        itemPrice: product.discPrice,
        zohoItemId: product.zohoItemId
      }
    });
    cartitems = await newCart.getProducts();
    //console.log(cartitems);
    res.status(200).json({
      "msg": "success",
      "cartproducts": cartitems
    });
  } catch (err) {
    res.status(500).json({
      msg: "fail"
    });
    console.log("Error while adding to cart due to error:" + err);
  };
  

};

exports.get403 = (req, res) => {
  let message=req.flash("message");
  if (message.length<1){
    message=null;
  }
  res.render("403",{message:message});    
  }

exports.getsales = async (req, res) => {
  const month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const d = new Date();
  let year = d.getFullYear();
  let totalsales = 0;
  let totalsales1 = 0;
  let balanceamt = 0;
  let sales;
  let apidata;
  let apidata1;
  let message = req.flash('message');
  let topproducts;

  const firstDay = new Date(year, 0, 1).getDate();
  const firstMonth = new Date(year, 0, 1).getMonth() + 1;
  const lastDay = new Date(year, 11, 31).getDate();
  const lastMonth = new Date(year, 11, 31).getMonth() + 1;
  const firstdate = firstMonth + '/' + firstDay + '/' + year;
  const lastdate = lastMonth + '/' + lastDay + '/' + year;
  const apifirstdate = year + '-' + '01' + '-' + '01';
  const apilastdate = year + '-' + '12' + '-' + '31';

  let saledata = [];
  let orderdata = [];
  try {
    if (message.length < 1) {
      message = null;
    }
    sales = await sequelize.query('select mon,max(total_amt) total_amt,max(order_cnt) order_cnt from(SELECT  extract(month from createdAT)-1 mon,sum(total_amount) total_amt,count(1) order_cnt FROM `XX_ORDERS` AS `order` WHERE `order`.`VENDOR_ID` = ? AND extract(year from createdAT) = ? GROUP BY extract(month from createdAT)-1 UNION select 0 mon ,0 total_amt,0 order_cnt from dual UNION select 1 mon ,0 total_amt,0 order_cnt from dual union select 2 mon ,0 total_amt,0 order_cnt from dual  UNION select 3 mon ,0 total_amt,0 order_cnt from dual  union select 4 mon ,0 total_amt,0 order_cnt from dual  union select 5 mon ,0 total_amt,0 order_cnt from dual  union select 6 mon ,0 total_amt,0 order_cnt from dual  union select 7 mon ,0 total_amt,0 order_cnt from dual  union select 8 mon ,0 total_amt,0 order_cnt from dual  union  select 9 mon ,0 total_amt,0 order_cnt from dual  union select 10 mon ,0 total_amt,0 order_cnt from dual  union select 11 mon ,0 total_amt,0 order_cnt from dual )a group by mon order by mon', {
      replacements: [req.user.id, year],
      type: QueryTypes.SELECT
    });
    apidata = await zoho.getBills(req.user.zohovendorId, res.locals.accesstoken, apifirstdate, apilastdate);
    //console.log(apidata);
    if (apidata.code == 0) {
      let {
        bills
      } = apidata;
      if (bills.length > 0) {
        bills.forEach(bill => {
          totalsales += bill.total;
          balanceamt += (bill.status === 'open') ? bill.total : 0;
          console.log(balanceamt);
        });
      }
      console.log(bills);
    } else {
      throw apidata.message;
    }
    apidata1 = await zoho.getBills(req.user.zohovendorId, res.locals.accesstoken, null, null);
    if (apidata1.code == 0) {
      let {
        bills
      } = apidata;
      if (bills.length > 0) {
        bills.forEach(bill => {
          totalsales1 += bill.total;
        });
      }
    } else {
      throw apidata1.message;
    }
    
    totalsales = await sequelize.query('SELECT  sum(TOTAL_AMOUNT) total_sale_amt FROM `XX_ORDERS` AS `order` WHERE `order`.`VENDOR_ID` = ? AND extract(year from createdAT) = ? ', {
      replacements: [req.user.id,year],
      type: QueryTypes.SELECT
    });
    topproducts=await sequelize.query('select * from (select total_sales,item_image_url,item_id,ITEM_NAME,RANK() over( order by total_sales desc) ranking from (select sum((ITEM_COST_PRICE+TAX_AMT)*ITEM_QUANTITY) total_sales ,ITEM_IMAGE_URL,ITEM_ID,ITEM_NAME from ( select xxoi.ITEM_QUANTITY,xxi.ITEM_COST_PRICE,ceil((xxi.ITEM_COST_PRICE*xxi.ITEM_TAX_PERCENT)/100) TAX_AMT,xxi.ITEM_IMAGE_URL,xxi.ITEM_ID,xxi.ITEM_NAME FROM XX_ORDERS xxo, XX_ORDER_ITEMS xxoi,XX_ITEMS xxi where xxo.VENDOR_ID=? and xxo.ORDER_ID =xxoi.ORDER_ID and xxoi.ITEM_ID=xxi.ITEM_ID ) a group by ITEM_IMAGE_URL,ITEM_ID,xxi.ITEM_NAME) b) c where ranking <11', {
      replacements: [req.user.id],
      type: QueryTypes.SELECT
    });
    console.log("topproducts");
    console.log(topproducts);
    saledata = sales.map(sale => sale.total_amt);
    orderdata = sales.map(sale => sale.order_cnt);
    let orderCnt = Order.findAll({
      where: {
        vendorId: req.user.id
      }
    });
    res.render("sales", {
      message: message,
      month: month,
      saledata: saledata,
      orderdata: orderdata,
      firstdate: firstdate,
      lastdate: lastdate,
      totalsales: totalsales[0].total_sale_amt,
      totalsales1:totalsales1,
      balanceamt: balanceamt,
      topproducts:topproducts
    });
  } catch (err) {
    req.flash('message', `Unexpected Error:${err}`);
    message = req.flash('message');
    res.render("sales", {
      message: message,
      month: month,
      saledata: saledata,
      orderdata: orderdata,
      firstdate: firstdate,
      lastdate: lastdate,
      totalsales: totalsales[0].total_sale_amt,
      totalsales1:totalsales1,
      balanceamt: balanceamt,
      topproducts:topproducts
    });
  }
}
  
  