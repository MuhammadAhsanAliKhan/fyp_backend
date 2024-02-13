const Db = process.env.ATLAS_URI;

const mongoose = require("mongoose");
//configure mongoose
mongoose.connect(Db, {});

const dbConnection = mongoose.connection;

dbConnection.on("error", (err) => {
    console.error("MongoDB Connection Error:", err);
});

dbConnection.once("open", () => {
    console.log("Connected to MongoDB");
});

module.exports = dbConnection;
