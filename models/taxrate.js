const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const Taxrate = sequelize.define('taxrate', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
    field: "TAX_ID"
  },
  taxName: {
    type: Sequelize.STRING,
    unique: true,
    field: "TAX_NAME"
  },
  zohoIntraTaxId: {
    type: Sequelize.DECIMAL(19),
    field: "ZOHO_INTRA_TAX_ID"
  },
  zohoInterTaxId: {
    type: Sequelize.DECIMAL(19),
    field: "ZOHO_INTER_TAX_ID"
  },
  taxrate: {
    type: Sequelize.DECIMAL(19),
    field: "TAX_RATE"
  }
}, {
  tableName: 'XX_TAX_RATES'
});

module.exports = Taxrate;
