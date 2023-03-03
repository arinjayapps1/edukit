const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../util/database');
const User = require('./user');

const School = sequelize.define('School',{
    id:{
      type:Sequelize.INTEGER,
      autoIncrement:true,
      allowNull:false,
      primaryKey:true,
      field:"SCHOOL_ID",
    },
   Name:{
    type:Sequelize.STRING,
    allowNull:false,
    field:"SCHOOL_NAME"
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
    field:"ADDRESS_LINE2"
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
   imageUrl:{
    type:Sequelize.STRING,
    allowNull:false,
    field:"SCHOOL_IMAGE_URL"
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
},
{
    tableName: 'XX_SCHOOLS'
}
);

module.exports=School;
