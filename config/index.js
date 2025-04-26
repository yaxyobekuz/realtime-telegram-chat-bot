require("dotenv").config();
const { botToken, mongodbUrl, port } = process.env;
module.exports = { botToken, mongodbUrl, port: port || 3000 };
