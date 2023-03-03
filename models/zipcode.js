const {
    Sequelize,
    DataTypes
} = require('sequelize');
const sequelize = require('../util/database');
const zip = sequelize.define('zipcode', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
        field: "ZIPCODE_ID",
    },
    location:{
        type: Sequelize.STRING
    },
    pincode:{
        type: Sequelize.INTEGER
    },
    state:{
        type: Sequelize.STRING
    },
    state1:{
        type: Sequelize.STRING
    },
    district:{
        type: Sequelize.STRING
    }
    ,city:{
        type: Sequelize.STRING
    }

}, {
    tableName: 'XX_ZIP_CODES'
});
module.exports = zip;