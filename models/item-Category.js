const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../util/database');

const Category = sequelize.define('Category',{
    id:{
      type:Sequelize.INTEGER,
      autoIncrement:true,
      allowNull:false,
      primaryKey:true,
      field:"CATEGORY_ID",
    },
   Name:{
    type:Sequelize.STRING,
    allowNull:false,
    field:"CATEGORY_NAME"
   },
   parentId:{
    type:Sequelize.INTEGER,
    field:"PARENT_ID"
   }
},
{
    tableName: 'XX_ITEM_CATEGORIES'
  }
);

module.exports=Category;
