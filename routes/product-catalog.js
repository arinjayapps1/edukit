const express = require("express");
const catalogueController= require("../controllers/product-catalog");
const router = express.Router();

router.get("/product-catalog",catalogueController.getProductCatalog);
router.get("/product-catalogapi",catalogueController.getProductCatalogbyapi);

module.exports= router;