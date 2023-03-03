const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../util/database');
const User = require('./user');

const Location = sequelize.define('location',{
  id:{
    type:Sequelize.INTEGER,
    autoIncrement:true,
    allowNull:false,   
    primaryKey:true,
    field:"LOCATION_ID"
  },
  userType:{
    type:Sequelize.STRING,
    allowNull:false,
    field:"LOCATION_USER_TYPE"
  },
  locationType:{
    type:Sequelize.STRING,
    allowNull:false,  
    field:"LOCATION_TYPE"
  },
 firstname:{
  type:Sequelize.STRING,
  allowNull:false,
  field:"CONTACT_FIRST_NAME"
 },
 lastname:{
  type:Sequelize.STRING,
  allowNull:false,
  field:"CONTACT_LAST_NAME"
 },
 country:{
  type:Sequelize.STRING,
  allowNull:false,
  field:"COUNTRY"
 },
 state:{
  type:Sequelize.STRING,
  allowNull:false,
  field:"STATE"
 },
 addressLine1:{
  type:Sequelize.STRING,
  allowNull:false,
  field:"ADDRESS_LINE1"
 },
 addressLine2:{
  type:Sequelize.STRING,
  allowNull:false,
  field:"ADDRESS_LINE2"
 },
 mobile:{
  type:Sequelize.STRING,
  allowNull:false,
  field:"MOBILE"
 },
 city:{
  type:Sequelize.STRING,
  allowNull:false,
  field:"CITY"
 },
 zipcode:{
  type:Sequelize.INTEGER,
  allowNull:false,
  field:"ZIPCODE"
 },
 zohocustbilltoaddressId:{
  type:Sequelize.STRING,
  field:"ZOHO_CUST_BILL_ADRESS_ID"
 },
 zohocustshiptoaddressId:{
  type:Sequelize.STRING,
  field:"ZOHO_CUST_SHIP_ADRESS_ID"
 },
 zohovendorbilltoaddressId:{
  type:Sequelize.STRING,
  field:"ZOHO_VENDOR_BILL_ADRESS_ID"
 },
 zohovendorshiptoaddressId:{
  type:Sequelize.STRING,
  field:"ZOHO_VENDOR_SHIP_ADRESS_ID"
 },
 status:{
  type:Sequelize.STRING,
  field:"STATUS"
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
}
},{
  tableName: 'XX_LOCATIONS'
});
module.exports=Location;