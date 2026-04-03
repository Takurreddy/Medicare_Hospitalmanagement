const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://admin:Takurmukku%4044@cluster0.bovsibb.mongodb.net/hospital_system?retryWrites=true&w=majority")
.then(() => console.log("✅ MongoDB Atlas Connected Successfully"))
.catch(err => console.log("❌ Connection Error:", err));

module.exports = mongoose;