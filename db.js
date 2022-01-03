const mongoose = require ("mongoose");

const mongoUri = process.env.MONGO_URI;

const connectToMongo = ()=>{
    mongoose.connect(mongoUri,()=>{
        console.log("Connected to mongoDb");
    })
};

module.exports = connectToMongo;