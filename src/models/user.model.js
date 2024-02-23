const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
        enum: ["student", "teacher", "admin"],
    },
});

const User = mongoose.model("User", userSchema, "Users");

module.exports = { User };
