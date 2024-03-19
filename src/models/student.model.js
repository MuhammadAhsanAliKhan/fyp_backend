const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    name: {
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
        required: false,
    },
    classes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Class",
        },
    ],
});

const Student = mongoose.model("Student", studentSchema, "Students");

module.exports = Student;
