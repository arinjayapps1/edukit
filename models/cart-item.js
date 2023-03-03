const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../util/database');
const Cart = require('./cart');
const Product = require('./product');

const CartItem = sequelize.define('cartItem',{
    id:{
        type:Sequelize.INTEGER,
        autoIncrement:true,
        allowNull:false,
        primaryKey:true,
        field:"CART_LINE_ID"
    },
    cartId: {
        type: Sequelize.INTEGER,
        field:"CART_ID",
        references: {
          // This is a reference to another model
          model: Cart,
     
          // This is the column name of the referenced model
          key: 'CART_ID'
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
    quantity:{type:Sequelize.INTEGER,
        field:"ITEM_QUANTITY"
    },
    itemPrice:{type:Sequelize.INTEGER,
        field:"ITEM_PRICE"
    }
},{
    tableName: 'XX_USER_CART_ITEMS'
}

);
module.exports=CartItem;