const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../util/database');

const User = sequelize.define('user',{
  id:{
      type:Sequelize.INTEGER,
      autoIncrement:true,
      allowNull:false,
      primaryKey:true,
      field:"USER_ID"
    },
  imageUrl:{
    type:Sequelize.STRING,
    field:"IMAGE_URL"
    },
  role:{
      type:Sequelize.STRING,
      allowNull:false,  
      field:"ROLE"
    },
  firstName:{
    type:Sequelize.STRING,
    allowNull:false,
    field:"FIRST_NAME"
  } ,
  lastName:{
    type:Sequelize.STRING,
    allowNull:false,
    field:"LAST_NAME"
  },
  email:{
    type:Sequelize.STRING,
    allowNull:false,
    unique:true,
    field:"USER_EMAIL"
  },
  zohovendorId:{
    type:Sequelize.STRING,
    unique:true,
    field:"ZOHO_VENDOR_ID"
  },
  zohocustomerId:{
    type:Sequelize.STRING,
    unique:true,
    field:"ZOHO_CUSTOMER_ID"
  },
  googleId:{
      type:Sequelize.STRING,
      unique:true,
      field:"GOOGLE_ID"
  },
  facebookId:{
    type:Sequelize.STRING,
    unique:true,
    field:"FACEBOOK_ID"
},
PASSWORD:{
    type:Sequelize.STRING
  },
MOBILE:{
    type:Sequelize.STRING
  },
  STATUS:{
    type:Sequelize.STRING
  },
  STAGE:{
    type:Sequelize.STRING
  }
  
  },
    {
      tableName: 'XX_FND_USERS'
    }
  );
  
  module.exports=User;