const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
    first_name: {
        type: String,
        required: true,
    },
    last_name: {
        type: String,
        required: true,
    },
    age: {
        type: Number,
        required: true,
    },
    cgpa: {
        type: Number,
        required: false,
    },
    admission_date: {
        type: Date,
        required: true,
    },
});

const Student = mongoose.model("Student", studentSchema, "Students");

module.exports = Student;
