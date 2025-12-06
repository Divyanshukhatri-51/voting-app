const mongoose = require("mongoose");
require("dotenv").config()

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("mongoDB connected");
        
    } catch(error) {
        console.error("Error connecting to the database", error);
    }
}

module.exports = { connectDB };