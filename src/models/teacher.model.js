const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    subject: {
        type: String,
        required: true,
    },
    age: {
        type: Number,
        required: true,
    },
});

const Teacher = mongoose.model("Teacher", teacherSchema, "Teachers");

module.exports = Teacher;
