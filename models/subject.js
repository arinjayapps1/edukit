const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../util/database');

const Subject = sequelize.define('subject',{
    id:{
      type:Sequelize.INTEGER,
      autoIncrement:true,
      allowNull:false,
      primaryKey:true,
      field:"SUBJECT_ID",
    },
   Name:{
    type:Sequelize.STRING,
    allowNull:false,
    field:"SUBJECT_NAME"
   }
   
},
{
    tableName: 'XX_SUBJECTS'
}
);

module.exports=Subject;
