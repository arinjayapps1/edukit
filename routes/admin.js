const express = require("express");
const {
  body,check
} = require("express-validator");
const adminController = require("../controllers/admin");
const isAuth = require("../middleware/isAuth");
const router = express.Router();
const csrf = require("csurf");
var csrfProtection = csrf();
const isBuyer=require("../middleware/isBuyer");
const isSeller  = require("../middleware/isSeller");

router.get("/add-product-book",isAuth,isBuyer,adminController.getAddProductBook)
router.get("/add-product", isAuth,adminController.getAddProduct);
router.get("/products", isAuth, isBuyer,adminController.getProducts);
router.post("/add-product-book",isAuth, isBuyer, [
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
], adminController.PostAddProductBook);

router.get("/edit-product/:productId", isAuth,isBuyer, adminController.getEditProduct);
router.post("/edit-product", isAuth, isBuyer,adminController.postEditProduct);
router.post("/delete-product", isAuth, isBuyer,adminController.postDeleteProduct);
router.get("/add-category", isAuth, isBuyer,adminController.getAddCategory);
router.post("/add-category",isAuth, isBuyer,[body('categoryName', 'Category Name cannot be empty and should contains ateast 4 characters.')
  .not().isEmpty().isString().isLength({
    min: 4
  }).trim()
],  adminController.postAddCategory);
router.get("/add-school",isAuth, isBuyer,adminController.getAddSchool);
router.post("/add-school",isAuth, isBuyer,[
  body('schoolName', 'School Name cannot be empty and should be atleast 5 character').not().isEmpty().isString().isLength({
  min: 5
}).trim(),
 body('address1', 'Address1 cannot be empty and should be atleast 6 characters').not().isEmpty().isString().isLength({
  min: 6
 }).trim(),
 body('address2', 'Address2 cannot be empty and should be atleast 6 characters').not().isEmpty().isString().isLength({
  min: 6
 }).trim(),
 body('state').custom((value,{req})=>{
  if(value=='Choose state'){
    throw new Error('Please select valid state');
  }
  return true;
}),
body('city').custom((value,{req})=>{
  if(value=='Choose city'){
    throw new Error('Please select valid city');
  }
  return true;
}),
body('zipcode').custom((value,{req})=>{
  if(value=='Choose pincode'){
    throw new Error('Please select valid pincode');
  }
  return true;
})
],isAuth,adminController.postAddSchool);
router.get("/school",isAuth, isBuyer,adminController.getSchool);
router.post("/school",isAuth, isBuyer,adminController.postSchool);
router.get("/add-bookset/:schoolId",isAuth,isBuyer,adminController.getAddBookset);

module.exports = router;