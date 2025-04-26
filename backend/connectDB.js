const mongoose = require("mongoose");
const { mongodbUrl } = require("../config");

const connectDB = async () => {
  try {
    await mongoose.connect(mongodbUrl);
    console.log("Mango Baza ulandi! ✅🥭🗿");
  } catch (err) {
    console.error("MongoDB error ❌", err);
    process.exit(1);
  }
};

module.exports = connectDB();
