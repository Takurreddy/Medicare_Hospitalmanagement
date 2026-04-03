const mongoose = require("mongoose");

const DEFAULT_MONGO_URI = "mongodb+srv://admin:Takurmukku%4044@cluster0.bovsibb.mongodb.net/hospital_system?retryWrites=true&w=majority";

async function connectDB() {
    const mongoURI = process.env.MONGO_URI || DEFAULT_MONGO_URI;
    await mongoose.connect(mongoURI, {
        serverSelectionTimeoutMS: 10000
    });
    console.log("MongoDB Connected");
}

module.exports = connectDB;
