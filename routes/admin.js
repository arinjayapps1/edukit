const express = require("express");
const {
  body,check
} = require("express-validator");
const adminController = require("../controllers/admin");
const isAuth = require("../middleware/isAuth");
const router = express.Router();
const csrf = require("csurf");
var csrfProtection = csrf();

router.get("/add-product-book",isAuth,adminController.getAddProductBook)
router.get("/add-product", isAuth, adminController.getAddProduct);
router.get("/products", isAuth, adminController.getProducts);
router.post("/add-product-book", [
  body('product_name', 'Product Name cannot be empty and should contains ateast 4 characters.')
  .not().isEmpty().isString().isLength({
    min: 4
  }).trim(), body('product_desc', 'Product Description cannot be empty and should contains ateast 4 characters. ')
  .not().isEmpty().isString().isLength({
    min: 4
  }).trim(), body('author', 'Author cannot be empty and should contains ateast 4 characters. ')
  .not().isEmpty().isString().isLength({
    min: 4
  }).trim(), body('publisher', 'Publisher cannot be empty and should contains ateast 4 characters. ')
  .not().isEmpty().isString().isLength({
    min: 4
  }).trim(), body('orig_price', 'Original Price cannot be empty and should contains only number. ')
  .not().isEmpty().isNumeric().isLength({
    min: 1
  }).trim(), body('disc_price', 'Discounted Price cannot be empty and should contains only number. ')
  .not().isEmpty().isNumeric().isLength({
    min: 0
  }).trim(),
  body('stock_qty', 'Stock Quantity cannot be empty and should contains only number. ')
  .not().isEmpty().isNumeric().isLength({
    min: 1
  }).trim(),
  body('disc_price').custom((value, { req }) => {
    if (value == req.body.orig_price) {
      throw new Error('Original Price and Discounted price cannot be same');
    }

    // Indicates the success of this synchronous custom validator
    return true;
  }),
  body('tax', 'Tax Rate cannot be empty. ')
  .trim().not().isEmpty(),
  body('category').custom((value,{req})=>{
    if(value=='Select Category'){
      throw new Error('Please select valid Book cateogory');
    }
    return true;
  }),
  body('subject').custom((value,{req})=>{

    if(value=='Select Subject'){
      throw new Error('Please select valid Subject');
    }
    return true;
  }),
  body('class').custom((value,{req})=>{

    if(value=='Select Class'){
      throw new Error('Please select valid Class');
    }
    return true;
  }),
  check('image')
.custom((value, {req}) => {
        if(req.file){
        if(req.file.mimetype==='image/png'||req.file.mimetype==='image/jpg'||req.file.mimetype==='image/jpeg'){
            return true; // return "non-falsy" value to indicate valid data"
        }else{
            return false; // return "falsy" value to indicate invalid data
        }
      }else{
       return false 
      }
    })
.withMessage('Images cannot be empty and it should be with extensions png/jpg/jpeg.')
], isAuth, adminController.PostAddProductBook);

router.get("/edit-product/:productId", isAuth, adminController.getEditProduct);
router.post("/edit-product", isAuth, adminController.postEditProduct);
router.post("/delete-product", isAuth, adminController.postDeleteProduct);
router.get("/add-category", isAuth, adminController.getAddCategory);
router.post("/add-category", [body('categoryName', 'Category Name cannot be empty and should contains ateast 4 characters.')
  .not().isEmpty().isString().isLength({
    min: 4
  }).trim()
], isAuth, adminController.postAddCategory);

module.exports = router;