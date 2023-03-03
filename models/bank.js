const {
    Sequelize,
    DataTypes
} = require('sequelize');
const sequelize = require('../util/database');

const bank = sequelize.define('Bank', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
        field: "BANK_DETAIL_ID",
    },
    AccountNum: {
        type: Sequelize.STRING,
        allowNull: false,
        field: "ACCOUNT_NUM",
    },
    AccountName: {
        type: Sequelize.STRING,
        allowNull: false,
        field: "ACCOUNT_NAME",
    },
    IFSC: {
        type: Sequelize.STRING,
        allowNull: false,
        field: "IFSC",
    },
    status:{
        type: Sequelize.STRING,
        allowNull: false,
        field: "STATUS",
    }
}, {
    tableName: 'XX_BANK_DETAILS'
});
module.exports = bank;