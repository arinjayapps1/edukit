const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../util/database');

const Class = sequelize.define('class',{
    id:{
      type:Sequelize.INTEGER,
      autoIncrement:true,
      allowNull:false,
      primaryKey:true,
      field:"CLASS_ID",
    },
   Name:{
    type:Sequelize.STRING,
    allowNull:false,
    field:"CLASS_NAME"
   }
   
},
{
    tableName: 'XX_CLASSES'
}
);

module.exports=Class;
