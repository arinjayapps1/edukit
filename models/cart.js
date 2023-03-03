const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../util/database');
const user = require("./user");

const Cart = sequelize.define('cart',{
    id:{
        type:Sequelize.INTEGER,
        autoIncrement:true,
        allowNull:false,
        primaryKey:true,
        field:"CART_ID"
    },
    userId: {
        type: Sequelize.INTEGER,
        field:"USER_ID",
        references: {
          // This is a reference to another model
          model: user,
     
          // This is the column name of the referenced model
          key: 'USER_ID'
        }
    }
     

},
{
    tableName: 'XX_USER_CARTS'
  }

);
module.exports=Cart;