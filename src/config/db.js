const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME || "node_blog_db",
  process.env.DB_USER || "root",
  process.env.DB_PASSWORD || process.env.DB_PASS || "123456",
  {
    host: process.env.DB_HOST || "127.0.0.1",
    port: process.env.DB_PORT || 3306,
    dialect: "mysql",
    logging: process.env.DB_LOGGING === "true" ? console.log : false,
  },
);

const checkConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connection established.");
  } catch (error) {
    console.error("Database connection failed:", error.message);
  }
};

if (process.env.SKIP_DB_CONNECT !== "true") {
  checkConnection();
}

module.exports = sequelize;
