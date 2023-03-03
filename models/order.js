const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../util/database');
const Location = require('./location');
const User = require('./user');

const Order = sequelize.define('order',{
    id:{
        type:Sequelize.INTEGER,
        autoIncrement:true,
        allowNull:false,
        primaryKey:true,
        field:"ORDER_ID"
    },
    zohoInvoiceId:{
     type:Sequelize.STRING,
    field:"ZOHO_INVOICE_ID"
    },
    zohoVendorId:{
        type:Sequelize.STRING,
       field:"ZOHO_VENDOR_ID"
       },
    zohoCustomerId:{
        type:Sequelize.STRING,
       field:"ZOHO_CUSTOMER_ID"
       },
    status:{
        type:Sequelize.STRING, 
        field:"STATUS"
    },
    zohoCode:{
        type:Sequelize.STRING, 
        field:"ZOHO_STATUS_CODE"
    },
    zohoMsg:{
        type:Sequelize.STRING, 
        field:"ZOHO_MSG"
    },
    sourceState:{
        type:Sequelize.STRING, 
        field:"SOURCE_STATE"
    },
    destinationState:{
        type:Sequelize.STRING, 
        field:"DESTNATION_STATE"
    },
    gstin:{
        type:Sequelize.STRING, 
        field:"GSTIN"
    },
    shipToLocationId:{
        type:Sequelize.INTEGER,
        field:"USER_SHIP_TO_LOCATION_ID",
        references: {
            // This is a reference to another model
            model: Location,
       
            // This is the column name of the referenced model
            key: 'LOCATION_ID'
          }
    
    },
    billToLocationId:{
        type:Sequelize.INTEGER,
        field:"USER_BILL_TO_LOCATION_ID",
        references: {
            // This is a reference to another model
            model: Location,
       
            // This is the column name of the referenced model
            key: 'LOCATION_ID'
          }
    },
    userId:{
        type:Sequelize.INTEGER,
        field:"USER_ID",
        references: {
            // This is a reference to another model
            model: User,
       
            // This is the column name of the referenced model
            key: 'USER_ID'
          }
    },
    vendorId:{
        type:Sequelize.INTEGER,
        field:"VENDOR_ID",
        references: {
            // This is a reference to another model
            model: User,
       
            // This is the column name of the referenced model
            key: 'USER_ID'
          }
    },
    subtotalAmt:{
        type:Sequelize.INTEGER,
        field:"SUBTOTAL_AMOUNT",
    },
    taxAmt:{
        type:Sequelize.INTEGER,
        field:"TAX_AMOUNT",
    },
    shipping:{
        type:Sequelize.INTEGER,
        field:"SHIPPING_AMOUNT",
    },
    totalAmt:{
        type:Sequelize.INTEGER,
        field:"TOTAL_AMOUNT",
    }
},{
    tableName: 'XX_ORDERS'
}

);
module.exports=Order;