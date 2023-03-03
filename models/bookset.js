const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../util/database');
const User = require('./user');
const School = require('./school');

const Bookset = sequelize.define('bookset',{
    id:{
      type:Sequelize.INTEGER,
      autoIncrement:true,
      allowNull:false,
      primaryKey:true,
      field:"BOOKSET_ID",
    },
   Name:{
    type:Sequelize.STRING,
    allowNull:false,
    field:"BOOKSET_NAME"
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
   SchoolId:{
    type:Sequelize.INTEGER,
    field:"SCHOOL_ID",
    references:{
        // This is a reference to another model
        model: School,
        // This is the column name of the referenced model
        key: 'SCHOOL_ID'
      }
   }
},
{
    tableName: 'XX_BOOKSETS'
  }
);

module.exports=Bookset;
