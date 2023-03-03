const {
    Sequelize,
    DataTypes
} = require('sequelize');
const sequelize = require('../util/database');

const GST = sequelize.define('gst', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
        field: "GST_DETAIL_ID"
    },
    gstin:{
        type:Sequelize.STRING,

        field: "GSTIN"
    },
    cname:{
        type:Sequelize.STRING,

        field: "COMPANY_NAME"
    },
    status:{
        type:Sequelize.STRING,
        field: "STATUS"
    },
    regdate:{
        type:Sequelize.STRING,
        field:"REGISTRATION_DATE"
    },
    btn:{
        type:Sequelize.STRING,
        field:"BUSINESS_TRADE_NAME"
    },
    ctb:{
        type:Sequelize.STRING,
        field:"BUSINESS_CONSTITUTION"
    },
    taxtype:{
        type:Sequelize.STRING,
        field:"TAX_TYPE"  
    }

}, {
    tableName: 'XX_GST_DETAILS'
});

module.exports=GST;