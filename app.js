require('dotenv').config();
const express = require("express");
const path = require("path");
const {
  QueryTypes,
  Op
} = require('sequelize');
const bodyParser = require("body-parser");
const Passport = require("passport");
const session = require("express-session");
const csrf = require("csurf");
const flash = require("connect-flash");
var cookieParser = require('cookie-parser');
const multer = require('multer');
const https = require("https");

/*routes*/
const shopRoute = require("./routes/shop");
const CatalogueRoute = require("./routes/product-catalog");
const sellerRoute = require("./routes/seller");
const errorController=require("./controllers/errorController");
const addressRoute = require("./routes/address");
const adminRoute = require("./routes/admin");
const authRoute = require("./routes/auth");
const sequelize = require('./util/database');



var SequelizeStore = require("connect-session-sequelize")(session.Store);

require('./util/passport');

/*Models*/
const Product = require('./models/product');
const Payment = require('./models/payment');
const User = require('./models/user');
const Cart = require('./models/cart');
const CartItem = require('./models/cart-item');
const OrderItem = require('./models/order-item');
const Order = require('./models/order');
const Location = require('./models/location');
const Category = require('./models/item-Category');
const School = require('./models/school');
const Class = require('./models/class');
const Bookset = require('./models/bookset');
const AcessToken = require('./models/acessToken');
const Subject = require('./models/subject');
const GST = require('./models/gst');
const Zip = require('./models/zipcode');
const Taxrate = require('./models/taxrate');
const {
  HttpRequest,
  HttpResponse
} = require('aws-sdk');
const bank = require('./models/bank');
//const Class     = require('./models/class');


const app = express();
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(multer().single('image'));
var csrfProtection = csrf();
app.use(session({
  secret: process.env.SESSION_KEY,
  resave: false,
  store: new SequelizeStore({
    db: sequelize,
  }),
  saveUninitialized: true
}));


app.use(express.static("public"));
app.use(Passport.initialize());
app.use(Passport.session());
app.use(flash());
app.use(csrfProtection);


//use middleware to populate classes
app.use((req, res, next) => {
  console.log("inside middleware to populate accesstoken" + req.isAuthenticated());
  const tokenurl = "https://accounts.zoho.in/oauth/v2/token?refresh_token=";
  const redirect_uri = "http://localhost:3000/callback";
  const refTok = "refresh_token";
  const refreshtok = process.env.ZOHO_REFRESH_TOKEN;
  const accessurl = tokenurl + refreshtok + "&client_id=" + process.env.ZOHO_CLIENT_ID + "&client_secret=" + process.env.ZOHO_CLIENT_SECRET + "&redirect_uri=" + redirect_uri + "&grant_type=" + refTok;
  const options = {
    method: 'POST'
  };
  var accesstoken1 = null;
  var apidata = null;
  //var preHour=date_sub(now(), INTERVAL 1 HOUR)

  AcessToken.findAll({
    where: {
      createdAt: {
        [Op.lt]: new Date(),
        [Op.gt]: new Date(new Date() - 1 * 60 * 60 * 1000)
      }

    }
  }).then(
    results => {
      if (results.length < 1) {
        const request = https.request(accessurl, options, response => {
          console.log(`statusCode: ${response.statusCode}`);
          response.on('data', d => {
            apidata = JSON.parse(d);
            console.log("apidata");
            console.log(apidata);
            accesstoken1 = apidata.access_token;
            res.locals.accesstoken = accesstoken1;
            AcessToken.create({
              acessToken: accesstoken1
            }).then(
              result => {
                next();
              }
            ).catch(
              err => {
                console.log("Error while Creating Access token due to error:"+ err);
              }
            );
          });
        });
        request.on('error', error => {
          console.log(error);
        });
        request.end();
      } else {
        //console.log("insdie else");
        //console.log(results[0].acessToken);
        res.locals.accesstoken = results[0].acessToken;
      }

    }
  ).catch(
    err => {
      console.log(err);
    }
  );


  next();
});

app.use(async (req, res, next) => {
  let cartItems;
  //console.log("inside middleware:"+req.isAuthenticated());
  //
  try{
    
    if(req.user){
      let newCart = await req.user.getCart();
      cartItems=await newCart.getProducts();
      
      //console.log("success");
    }
    else{
      console.log("test"+req.user);
      cartItems=[];
    }
    
    let categories= await Category.findAll({where:{parentId:null}});
    res.locals.cartItems=cartItems;
    res.locals.categories = categories;
    res.locals.isAuthenticated = req.session.isLoggedin;
    res.locals.csrfToken = req.csrfToken();
    next();
  
  }
  catch(err){
    console.log("Error in middleware function in getting cart o categories due to error:"+err)
  }

});


//all routes
app.use(shopRoute);
app.use(adminRoute);
app.use(authRoute);
app.use(addressRoute);
app.use(sellerRoute);
app.use(CatalogueRoute);
app.get("/callback", (req, res) => {
  console.log("inside callback");
  console.log(res);
  //console.log(req);
  //https.post()


});
app.use(errorController.get404);


//all associations
Product.belongsTo(User, {
  constraints: true,
  onDelete: 'CASCADE'
});
User.hasMany(Product);
User.hasMany(Location);
School.belongsTo(User, {
  constraints: true,
  onDelete: 'CASCADE'
});
User.hasMany(School);
Bookset.belongsTo(User, {
  constraints: true,
  onDelete: 'CASCADE'
});
User.hasMany(Bookset);
GST.belongsTo(User);

Product.belongsTo(Bookset);
Payment.belongsTo(User);
Bookset.hasMany(Product);
//User.hasMany(BillingAddress);
Location.belongsTo(User);
//BillingAddress.belongsTo(User);
User.hasOne(Cart);
Cart.belongsTo(User);
bank.belongsTo(User);
Cart.belongsToMany(Product, {
  through: CartItem
});
Product.belongsToMany(Cart, {
  through: CartItem
});
Order.belongsTo(User);
Location.hasMany(Order, {
  as: 'shipLoc',
  foreignKey: 'ShipToLocationId'
});
Location.hasMany(Order, {
  as: 'billLoc',
  foreignKey: 'billToLocationId'
});
Order.belongsTo(Location);
User.hasMany(Order);
Order.belongsToMany(Product, {
  through: OrderItem
});
Product.belongsToMany(Order, {
  through: OrderItem
});
sequelize.sync().then(result => {
  console.log(process.env.PORT);
  app.listen(process.env.PORT||3000, function () {
    console.log("server is running");
  });

}).catch(err => {
  console.log(err);
});
