const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../util/database');
const Order = require("../models/order");
const Product = require("../models/product");

const OrderItem = sequelize.define('orderitem',{
    id:{
        type:Sequelize.INTEGER,
        autoIncrement:true,
        allowNull:false,
        primaryKey:true,
        field:"ORDER_LINE_ID"
    },
    orderId: {
        type: Sequelize.INTEGER,
        field:"ORDER_ID",
        references: {
          // This is a reference to another model
          model: Order,
     
          // This is the column name of the referenced model
          key: 'ORDER_ID'
        }
    },
    zohoItemId:{
        type:Sequelize.STRING,
        field:"ZOHO_ITEM_ID"
    },
    productId: {
        type: Sequelize.INTEGER,
        field:"ITEM_ID",
        references: {
          // This is a reference to another model
          model: Product,
     
          // This is the column name of the referenced model
          key: 'ITEM_ID'
        }
    },
    zohoIntraTaxId: {
        type: Sequelize.DECIMAL(19),
        field: "ZOHO_INTRA_TAX_ID"
      },
      zohoInterTaxId: {
        type: Sequelize.DECIMAL(19),
        field: "ZOHO_INTER_TAX_ID"
      },
    productName:{
        type:Sequelize.STRING,
        field:"ITEM_NAME"
    },
    quantity:{type:Sequelize.INTEGER,
        field:"ITEM_QUANTITY"
    },
    itemPrice:{type:Sequelize.INTEGER,
        field:"ITEM_PRICE"
    },
    itemCostPrice:{type:Sequelize.INTEGER,
        field:"ITEM_COST_PRICE"
    }
},{
    tableName: 'XX_ORDER_ITEMS'
}

);
module.exports=OrderItem;