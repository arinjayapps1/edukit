const {
  validationResult
} = require("express-validator");
const sequelize = require('../util/database');
const {
  QueryTypes
} = require('sequelize');
const Product = require('../models/product');

const Category = require('../models/item-Category');
const Class = require('../models/class');
const Subject= require('../models/subject');
const Taxrate = require('../models/taxrate');
const Spaces = require("../util/spaces");
const cloudinary = require("../util/cloudinary");
const zoho = require("../util/zoho");
//const flash    = require("connect-flash");
const https = require("https");
const axios = require("axios");
const request = require("request");
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const mime = require("mime-types");
const {
  v4: uuid
} = require("uuid");
const {
  promiseImpl
} = require("ejs");
const tokenurl = "https://accounts.zoho.in/oauth/v2/token?refresh_token=";
const redirect_uri = "http://localhost:3000/callback";
const refTok = "refresh_token";
const refreshtok = process.env.ZOHO_REFRESH_TOKEN;
//configuring AWS bucket
const spacesEndpoint = new AWS.Endpoint(process.env.S3_BUCKET_ENDPOINT);
const s3 = new AWS.S3({
  endpoint: spacesEndpoint,
  accessKeyId: process.env.S3_BUCKET_KEY,
  secretAccessKey: process.env.S3_BUCKET_SECRET
});
//
const itemUrl = "https://books.zoho.in/api/v3/items?organization_id=" + process.env.ZOHO_ORG_ID;
const accessurl = tokenurl + refreshtok + "&client_id=" + process.env.ZOHO_CLIENT_ID + "&client_secret=" + process.env.ZOHO_CLIENT_SECRET + "&redirect_uri=" + redirect_uri + "&grant_type=" + refTok;

exports.getAddProduct = (req, res) => {
  let message = req.flash("producterrMsg");
  if (message.length < 1) {
    message = null;
  }
  res.render('add-product',{message:message});

};

exports.getAddProductBook = async (req, res) => {
  
  let product = req.session.product; 
  let validate;
  console.log(product);
  let message = req.flash("producterrMsg");
  if (message.length < 1) {
    message = null;
  }
   try{
    let taxes      = await Taxrate.findAll();
    let classes    = await Class.findAll();
    let subjects   = await Subject.findAll();
    let category   = await Category.findAll({where:{Name:'School Books'}});
    let categories = await Category.findAll({where:{parentId:category[0].id}});
    
    if (product){
      req.session.product=null;
      await req.session.save();
      subjects =subjects.filter(subject=>{
      return subject.Name!=product.subject
    });
    validate='was-validated';
    classes =classes.filter(c=>{
      return c.Name!=product.class
    });
    categories=categories.filter(c=>{
      return c.Name!=product.category
    });
    taxes=taxes.filter(t=>{
      return t.taxName!=product.tax
    })

    }
    else{
      product={productName:null,
        productDesc:null,
        origPrice:null,
        discPrice:null,
        author:null,
        className:null,
        publisher:null,
        subject:null,
        tax:null,
        category:null
       };
    }
    res.render('add-product-book', {
      message: message,
      taxes: taxes,
      classes: classes,
      subjects:subjects,
      categories:categories,
      product:product
    });
   }
   catch(err){
    console.log(err);
   }
  //console.log(fetchedtaxes);

};


exports.getAddCategory = (req, res) => {
  console.log("inside getAddCategory");

  var errMsg = req.flash('categoryerr');
  //console.log(req.session);
  var msg;
  if (errMsg.length > 0) {

    msg = errMsg;
  } else {
    msg = null;
  }

  res.render('add-category', {
    message: msg
  });

};

exports.postAddCategory = (req, res) => {
  console.log("inside postAddCategory");
  const result = validationResult(req);
  var categoryName = req.body.categoryName;
  var errMsg = [];
  let i = 0;
  if (!result.isEmpty()) {
    result.array().forEach(msg => {
      if (!errMsg.includes(msg.msg)) {
        errMsg[i] = msg.msg;
      }

      i++;
    });
    res.render("add-category", {
      message: errMsg
    });

  }
  //console.log("inside postAddCategory");
  Category.findAll({
    where: {
      Name: categoryName
    }
  }).then(categories => {
    //console.log("Categories:"+categories.length);

    if (categories.length > 0) {
      //console.log("inside if");
      req.flash('categoryerr', 'Category already exists.');
      req.session.save(err => {
        res.redirect("/add-category");
      });


    } else {
      //console.log("inside else");
      Category.create({
        Name: categoryName
      }).then(category => {
        //console.log("Category created.")
        res.redirect("/add-category");
      }).catch(err => {
        console.log("Error while creating Category:" + err);
      });

    }

  }).catch(err => {
    console.log("Error while Fetching Category" + err);
  });



};


exports.getProducts = (req, res) => {
  //let fetchedtaxes;
  //console.log(req.isAuthenticated());
  //console.log(req.session.passport.user.id);

  Product.findAll({
    where: {
      userId: req.session.user.id
    }
  }).then(
    products => {
      res.render("products", {
        products: products
      })
    }
  ).catch(err => {
    console.log(err);
  });

};

exports.postDeleteProduct = (req, res) => {

  const productId = req.body.prodId;
  let imageUrl;
  let imgkeystart;
  let imagekey;
  //console.log(productId);
  Product.findByPk(productId).then(product => {
    imageUrl = product.imageUrl;
    //console.log("imageurl:" + imageUrl);
    imgkeystart = imageUrl.indexOf("/", 10);
    //console.log("imgkeystart:" + imgkeystart);
    imagekey = imageUrl.substr(imgkeystart + 1);
    //console.log(imagekey);
    s3.deleteObject({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: imagekey
    }, (err, data) => {
      if (err) {
        console.log(err);
      } else {
        //console.log("deleted");
        product.destroy().then(result => {
          res.redirect("products");
        }).catch(err => {
          console.log("Error while deleting product:" + productId + "with " + err);
        });
      }
    });
  }).catch(
    err => {
      console.log("Error while fetching product by productid: " + productId);
    }
  );

};

exports.postEditProduct = (req, res) => {

  const updatedName = req.body.product_name;
  const updated_orig_price = req.body.orig_price;
  const updated_disc_price = req.body.disc_price;
  const productId = req.body.prodId;
  Product.findByPk(productId).then(
      product => {
        product.name = req.body.product_name;
        product.origPrice = req.body.orig_price;
        product.discPrice = req.body.disc_price;
        product.imageUrl = "images/abc-book.jpg";
        product.userId = req.session.passport.user.id;
        return product.save();
      }).then(
      result => {
        res.redirect("/products");
      }
    )
    .catch(err => {
      console.log("Error while editing product:" + productId + "with " + err);
    });

};

exports.getEditProduct = (req, res) => {
  //console.log(req.isAuthenticated());
  //console.log(req.session.passport.user.id);
  const productId = req.params.productId;
  Product.findByPk(productId).then(
    product => {
      res.render("edit-product", {
        product: product
      });
    }
  ).catch(err => {
    console.log("Error while fetching product on edit-product page for:" + productId + "with " + err);
  });

};

exports.PostAddProductBook = async (req, res) => {
  let i           =   0;
  let errmsg      =   [];
  let zohoItemId  =   0;
  let discPrice   =   0;
  let perAmt      =   0;
  let sellPrice   =   0;
  let margin      =   0;
  let productName =   req.body.product_name;
  let productDesc =   req.body.product_desc;
  let origPrice   =   req.body.orig_price;
  let costPrice   =   Number(origPrice)-Number(req.body.disc_price);
  discPrice       =   Number(origPrice)-Number(req.body.disc_price);
  margin          =   (discPrice*3)/100;
  sellPrice       =   Number(discPrice)+Number(margin);
  //sellPrice = (req.body.disc_price+(((req.body.disc_price)*3)/100));
  let userId      =   req.session.user.id;
  let category    =   req.body.category;
  let author      =   req.body.author;
  let className   =   req.body.class;
  let publisher   =   req.body.publisher;
  let subject     =   req.body.subject;
  let ISBN        =   req.body.ISBN;
  let stockQty    =   req.body.stock_qty;
  let taxfield    =   req.body.tax;
  let taxPercent  =   0; //  = req.body.tax_percent;
  let taxAmt      =   0;//((req.body.disc_price*tax)/100);
  let imageUrl;
  //
  let accessToken;
  let itemId;
  let data;
  let data1;
  let product;
  console.log("post calling");
 //
 try{
    let categoryDetails = await Category.findByPk(category);
    let subjectDetails  = await Subject.findByPk(subject);
    let classDetails    = await Class.findByPk(className);
    let rateDetails     = await Taxrate.findByPk(taxfield);

    //let subjectDetails  = Subject.findAll(){{where:{Name:subject}}};
    product = {
      productName: productName,
      nameStatus: 'is-valid',
      productDesc: productDesc,
      descStatus: 'is-valid',
      origPrice: origPrice,
      origPriceStatus:  'is-valid',
      discPrice: req.body.disc_price,
      discPriceStatus: 'is-valid',
      author: author,
      authorStatus: 'is-valid',
      classId:(classDetails===null)?undefined:classDetails.id,
      className: (classDetails===null)?undefined:classDetails.Name,
      classStatus:  'is-valid',
      publisher: publisher,
      publisherStatus:  'is-valid',
      subjectId:(subjectDetails===null)?undefined:subjectDetails.id,
      subject: (subjectDetails===null)?undefined:subjectDetails.Name,
      subjectStatus: 'is-valid',
      taxId: (rateDetails===null)?undefined:rateDetails.id,
      tax: (rateDetails===null)?undefined:rateDetails.taxName,
      taxStatus:  'is-valid',
      stockQty:stockQty,
      stockQtyStatus:'is-valid',
      categoryId:(categoryDetails===null)?undefined:categoryDetails.id,
      category: (categoryDetails===null)?undefined:categoryDetails.Name,
      categoryStatus: 'is-valid',
    };
  const result = validationResult(req);
  if (!result.isEmpty()) {
    console.log(result);
    result.array().forEach(msg => {
      if (!errmsg.includes(msg.msg)) {
        errmsg[i] = msg.msg;
      }

      i++;
    });

    req.session.product = {
      productName: productName,
      nameStatus: result.array().find(e => e.param === 'product_name') ? 'is-invalid' : 'is-valid',
      productDesc: productDesc,
      descStatus: result.array().find(e => e.param === 'product_desc') ? 'is-invalid' : 'is-valid',
      origPrice: origPrice,
      origPriceStatus: result.array().find(e => e.param === 'orig_price') ? 'is-invalid' : 'is-valid',
      discPrice: req.body.disc_price,
      discPriceStatus: result.array().find(e => e.param === 'disc_price') ? 'is-invalid' : 'is-valid',
      author: author,
      authorStatus: result.array().find(e => e.param === 'author') ? 'is-invalid' : 'is-valid',
      classId:(classDetails===null)?undefined:classDetails.id,
      className: (classDetails===null)?undefined:classDetails.Name,
      classStatus: result.array().find(e => e.param === 'class') ? 'is-invalid' : 'is-valid',
      publisher: publisher,
      publisherStatus: result.array().find(e => e.param === 'publisher') ? 'is-invalid' : 'is-valid',
      subjectId:(subjectDetails===null)?undefined:subjectDetails.id,
      subject: (subjectDetails===null)?undefined:subjectDetails.Name,
      subjectStatus: result.array().find(e => e.param === 'subject') ? 'is-invalid' : 'is-valid',
      taxId: (rateDetails===null)?undefined:rateDetails.id,
      tax: (rateDetails===null)?undefined:rateDetails.taxName,
      stockQty:stockQty,
      stockQtyStatus:result.array().find(e => e.param === 'stock_qty') ? 'is-invalid' : 'is-valid',
      taxStatus: result.array().find(e => e.param === 'tax') ? 'is-invalid' : 'is-valid',
      categoryId:(categoryDetails===null)?undefined:categoryDetails.id,
      category: (categoryDetails===null)?undefined:categoryDetails.Name,
      categoryStatus: result.array().find(e => e.param === 'category') ? 'is-invalid' : 'is-valid',
    };
    req.flash("producterrMsg", errmsg);
    req.session.save(err => {
      res.redirect("/add-product-book");
    }) ;
  }
  else{
    
    let products = await Product.findAll({
      where: {
        USER_ID: req.session.user.id,
        ITEM_NAME: productName
      }
    });
    if (products.length > 0) {
      req.flash("producterrMsg", "This Product already exists.");
      req.session.product=product;
      req.session.save(err => {
        res.redirect("/add-product-book");
      });
    } else {
      console.log("req.body");
      console.log(req.body);
      console.log("before uplaoding image");
          data = await Spaces.uploadFileToS3({
            file: req.file
          });

          data1 = await cloudinary.uploadImage(data.Url);
          //console.log("data1");
          //console.log(data1);
          //data1=null;

          const {
            eager
          } = data1;

          imageUrl = eager[1].url;
          let rate = await Taxrate.findByPk(taxfield);
          taxAmt = ((sellPrice * rate.taxrate) / 100);
          console.log("calling product create");
          console.log(rate);
          //
          let newProduct = await Product.create({
            name: productName,
            description: productDesc,
            origPrice: origPrice,
            discPrice: sellPrice,
            imageUrl: imageUrl,
            userId: userId,
            categoryId:categoryDetails.id,
            categoryName: categoryDetails.Name,
            className: classDetails.Name,
            classId:classDetails.id,
            author: author,
            publisher: publisher,
            subject: subjectDetails.Name,
            ISBN: ISBN,
            taxAmt: taxAmt,
            stockQty: stockQty,
            taxPercent: rate.taxrate,
            zohoIntraTaxId:rate.zohoIntraTaxId,
            zohoInterTaxId:rate.zohoInterTaxId,
            costPrice:costPrice,
            status: 'inactive'

          });
          console.log("after calling product create");
          //calling zohoCreateItem API
          let apidata = await zoho.createItem(newProduct, req, res);
          if (apidata.code != 0) {
            console.log("inside apidata.code<>0");
            throw apidata.message;
          } else {
            itemId = apidata.item.item_id;
            Product.findByPk(newProduct.id).then(
              p => {
                p.zohoCode = apidata.code;
                p.zohoMsg = apidata.message;
                p.zohoItemId = itemId;
                p.status = 'active';
                return p.save();
              }
            ).then(result => {
              res.redirect("/products");
            });
          }
    }
  }
 }
 catch(err){
  if (err == "TypeError: Cannot destructure property 'eager' of 'data1' as it is null.") {
    req.flash("producterrMsg", "Please retry to load an Item.");
  } else {
    req.flash("producterrMsg", "Please contact customer care.Unexpected " + err);
  }
  req.session.product=product;
  req.session.save(err => {
    res.redirect("/add-product-book");
  });
 }
/*
    sequelize.query('SELECT  * FROM XX_TAX_RATES WHERE TAX_ID = ? ', {
      replacements: [tax],
      type: QueryTypes.SELECT
    }).then(
      results => {
        taxPercent = results[0].TAX_RATE;
        if (taxPercent != 0) {
          taxAmt = (sellPrice * (taxPercent / 100));
        }
        console.log("taxAmt:" + taxAmt);
        console.log(taxPercent);

        if (req.body.class === 'Select Class') {
          className = null;
        }
        const result = validationResult(req);
        if (!result.isEmpty()) {
          result.array().forEach(msg => {
            if (!errmsg.includes(msg.msg)) {
              errmsg[i] = msg.msg;
            }

            i++;
          });
          req.flash("producterrMsg", errmsg);
          req.session.save(err => {
            res.redirect("/add-product");
          })

          //res.render("add-product-book",{message:errmsg});

        } else {
          if (!req.body.ISBN) {
            Product.findAll({
              where: {
                USER_ID: req.session.user.id,
                ITEM_NAME: productName
              }
            }).then(
              findproducts => {
                //console.log(findproducts);
                if (findproducts.length > 0) {
                  req.flash("producterrMsg", "This Product already exists.");
                  req.session.save(err => {
                    res.redirect("/add-product");
                  });

                } else {
                  Spaces.uploadFileToS3({
                      file: req.file
                    })
                    .then(data => {
                      imageUrl = data.Url;
                      //console.log(data);
                      Product.create({
                        name: productName,
                        description: productDesc,
                        origPrice: origPrice,
                        discPrice: sellPrice,
                        imageUrl: imageUrl,
                        userId: userId,
                        categoryName: category,
                        className: className,
                        author: author,
                        publisher: publisher,
                        subject: subject,
                        ISBN: ISBN,
                        taxAmt: taxAmt,
                        stockQty: stockQty,
                        taxPercent: taxPercent

                      }).then((newproduct) => {
                        const options = {
                          method: 'POST',
                          headers: {
                            "Content-Type": "application/json;charset=UTF-8",
                            "Authorization": "Zoho-oauthtoken " + res.locals.accesstoken
                          }
                        };
                        const itemData = {
                          "name": req.session.user.id + "-" + productName,
                          "rate": sellPrice,
                          "description": productDesc,
                          "product_type": "goods",
                          "is_taxable": true,
                          "purchase_account_id": "845796000000000567",
                          "purchase_account_name": "Cost of Goods Sold",
                          "account_id": "845796000000000486",
                          "account_name": "Sales",
                          "item_type": "sales_and_purchases",
                          "purchase_rate": req.body.disc_price,
                          "item_tax_preferences": [{
                              "tax_specification": "inter",
                              "tax_type": 0,
                              "tax_name": "IGST" + tax,
                              "tax_percentage": results[0].TAX_RATE,
                              "tax_id": results[0].ZOHO_INTER_TAX_ID
                            },
                            {
                              "tax_specification": "intra",
                              "tax_type": 2,
                              "tax_name": "GST" + tax,
                              "tax_percentage": results[0].TAX_RATE,
                              "tax_id": results[0].ZOHO_INTRA_TAX_ID
                            }
                          ]
                        };
                        const request = https.request(itemUrl, options, response => {
                          console.log(`statusCode: ${response.statusCode}`);
                          response.on('data', d => {
                            apidata = JSON.parse(d);
                            if (apidata.code != 0) {
                              itemId = null;
                            } else {
                              itemId = apidata.item.item_id;
                            }
                            Product.findByPk(newproduct.id).then(
                                p => {
                                  p.zohoCode = apidata.code;
                                  p.zohoMsg = apidata.message;
                                  p.zohoItemId = itemId;
                                  return p.save();
                                }
                              ).then(result => {
                                res.redirect("/products");
                              })
                              .catch();
                            //console.log(apidata.item.item_id);
                            //res.send(apidata);
                          });
                        });
                        request.on('error', error => {
                          console.log(error);
                        });
                        request.write(JSON.stringify(itemData));
                        request.end();

                      }).catch();
                    });
                }
              }
            ).catch(err => {
              console.log("Error while FInding Products in method add product:" + err);
            })

          } else {
            url = "https://www.googleapis.com/books/v1/volumes?q=isbn:" + req.body.ISBN + "&fields=kind,totalItems,items(kind,volumeInfo.title,volumeInfo.authors,volumeInfo.imageLinks,volumeInfo.publisher)";
            console.log("url:" + url);
            //"https://www.googleapis.com/books/v1/volumes?q=isbn:"+req.body.ISBN+'&projection=lite';
            https.get(url, (response) => {
              response.on("data", data => {
                //console.log("data:"+data);
                var results = JSON.parse(data);
                if (results.totalItems != 0) {

                  productName = results.items[0].volumeInfo.title;
                  author = results.items[0].volumeInfo.authors[0];
                  publisher = results.items[0].volumeInfo.publisher;
                  imageUrl = results.items[0].volumeInfo.imageLinks.smallThumbnail;

                  Product.create({
                    name: productName,
                    origPrice: origPrice,
                    discPrice: discPrice,
                    imageUrl: imageUrl,
                    userId: userId,
                    categoryName: categoryName,
                    className: className,
                    author: author,
                    publisher: publisher,
                    subject: subject,
                    ISBN: ISBN,
                    taxAmt: taxAmt,
                    stockQty: stockQty,
                    taxPercent: taxPercent
                  }).then(() => {


                      res.redirect("/products");
                    }

                  ).catch(err => {
                    //console.log("Error while inserting product on add-product page" + err);
                    console.log('Error while inserting into products:' + err + " " + req.body.product_name)
                  })
                }

              });
            });
          }
        }
      }
    ).catch(err => {
      console.log(err);
    });*/

};