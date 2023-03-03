const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../util/database');
const payment = sequelize.define('payment',{
    id:{
      type:Sequelize.INTEGER,
      autoIncrement:true,
      allowNull:false,
      primaryKey:true,
      field:"PAYMENT_ID"
    },
    razorpayorderid:{
      type:Sequelize.STRING,
        field:"RAZORPAY_ORDER_ID"
      },
      status:{
        type:Sequelize.STRING,
        field:"STATUS"
      },
      razorpaypaymentid:{
        type:Sequelize.STRING,
        field:"RAZORPAY_PAYMENT_ID"
      },
      amount:{
        type:Sequelize.INTEGER,
        field:"AMOUNT"
      }
    },{
        tableName: 'XX_PAYMENTS'
      });
module.exports=payment;