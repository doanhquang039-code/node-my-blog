const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Newsletter = sequelize.define(
  "Newsletter",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    subscription_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    tableName: "newsletters",
    timestamps: false,
  }
);

module.exports = Newsletter;
