const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../util/database');
const User = require('./user');
const Bookset = require('./bookset');
const Category = require('./item-Category');
const Class = require('./class');

const Product = sequelize.define('product',{
  id:{
    type:Sequelize.INTEGER,
    autoIncrement:true,
    allowNull:false,
    primaryKey:true,
    field:"ITEM_ID"
  },
zohoItemId:{
  type:Sequelize.STRING,
  field:"ZOHO_ITEM_ID"
},
zohoCode:{
  type:Sequelize.STRING, 
  field:"ZOHO_STATUS_CODE"
},
zohoMsg:{
  type:Sequelize.STRING, 
  field:"ZOHO_MSG"
},
name:{
  type:Sequelize.STRING,
  allowNull:false,
  field:"ITEM_NAME"
} ,
description:{
  type:Sequelize.STRING,
  allowNull:false,
  field:"ITEM_DESCRIPTION"
} ,
origPrice:{
type:Sequelize.DOUBLE,
allowNull:false,
field:"ITEM_ORIG_PRICE"
},
discPrice:{
  type:Sequelize.DOUBLE,
  allowNull:false,
  field:"ITEM_DISC_PRICE"
  },
costPrice:{
    type:Sequelize.DOUBLE,
    allowNull:false,
    field:"ITEM_COST_PRICE"
    },
taxPercent:{
    type:Sequelize.DOUBLE,
    allowNull:false,
    field:"ITEM_TAX_PERCENT"
    },  
taxAmt:{
type:Sequelize.DOUBLE,
allowNull:false,
field:"ITEM_TAX_AMOUNT"
},  
zohoIntraTaxId: {
  type: Sequelize.DECIMAL(19),
  field: "ZOHO_INTRA_TAX_ID"
},
zohoInterTaxId: {
  type: Sequelize.DECIMAL(19),
  field: "ZOHO_INTER_TAX_ID"
},
  
imageUrl:{
  type:Sequelize.STRING,
  allowNull:false,
  field:"ITEM_IMAGE_URL"
},
board:{
  type:Sequelize.STRING,
  field:"BOARD"
},
subject:{
  type:Sequelize.STRING,
  field:"SUBJECT"
},
language:{
  type:Sequelize.STRING,
  field:"LANGUAGE"
},
isbn:{
  type:Sequelize.STRING,
  field:"ISBN"
},
publisher:{
  type:Sequelize.STRING,
  field:"PUBLISHER"
},
author:{
  type:Sequelize.STRING,
  field:"AUTHOR"
},
manufacturer:{
  type:Sequelize.STRING,
  field:"MANUFACTURER"
},
size:{
  type:Sequelize.STRING,
  field:"SIZE"
},
stockQty:{
  type:Sequelize.STRING,
  field:"STOCK_QTY"
},
userId: {
  type: Sequelize.INTEGER,
  field:"USER_ID",
  references: {
    // This is a reference to another model
    model: User,

    // This is the column name of the referenced model
    key: 'USER_ID'
  }
},
booksetId:{
  type: Sequelize.INTEGER,
  field:"BOOKSET_ID",
  references: {
    model:Bookset,
    key: 'BOOKSET_ID'
  }
},
className:{
  type:Sequelize.STRING,
  field:"CLASS_NAME"
},
classId:{
  type: Sequelize.INTEGER,
  field:"CLASS_ID",
  references: {
    // This is a reference to another model
    model: Class,

    // This is the column name of the referenced model
    key: 'CLASS_ID'
  } 
},
categoryName:{
  type:Sequelize.STRING,
  field:"CATEGORY_NAME"
},
status:{
  type:Sequelize.STRING,
  field:"STATUS"
},
categoryId: {
  type: Sequelize.INTEGER,
  field:"CATEGORY_ID",
  references: {
    // This is a reference to another model
    model: Category,

    // This is the column name of the referenced model
    key: 'CATEGORY_ID'
  }
}

},
{
  tableName: 'XX_ITEMS'
});

module.exports=Product;