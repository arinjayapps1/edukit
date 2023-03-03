const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../util/database');

const acessToken = sequelize.define('accessToken',{
    id:{
        type:Sequelize.INTEGER,
        autoIncrement:true,
        allowNull:false,
        primaryKey:true,
        field:"ACCESS_ID",
      },
    acessToken:{
        type:Sequelize.STRING,
        allowNull:false,
        field:"ACCESS_TOKEN",
   }
},{
    tableName: 'XX_ACCESS_TOKENS'
}
);
module.exports=acessToken;