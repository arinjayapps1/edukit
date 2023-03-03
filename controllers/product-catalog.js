const Product = require('../models/product');


exports.getProductCatalog = (req, res) => {
  Product.findAll({
    where: {
      status: 'active'
    }
  }).then(
    products => {
      res.render('product-catalog', {
        products: products

      });

    }
  ).catch(
    err => {
      console.log("Error while fetching all products in product-catalog page due to error:" + err);
    }
  );

};

exports.getProductCatalogbyapi = (req, res) => {
  Product.findAll({
    where: {
      status: 'active'
    }
  }).then(
    products => {
      res.status(200).json({
        "msg": "success",
        "products": products
      });


    }
  ).catch(
    err => {
      res.status(500).json({
        msg: "fail"
      });
      console.log("Error while fetching all products in product-catalog page due to error:" + err);
    }
  );

};