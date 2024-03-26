const mongoose = require("mongoose");

// const botMessageSchema = new mongoose.Schema({
//     student: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Student",
//         required: true,
//     },
//     prompt: {
//         type: String,
//         required: true,
//     },
//     response: {
//         type: String,
//         required: true,
//     },
//     timestamp: {
//         type: Date,
//         required: true,
//     },
// });

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
        required: false,
    },
    cgpa: {
        type: Number,
        required: false,
    },
    admission_date: {
        type: Date,
        required: false,
    },
    profile_picture: {
        filename: String,
        path: String,
    },
    classes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Class",
        },
    ],
    quiz_grades: [
        {
            quiz: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Quiz",
                required: true,
            },
            grade: {
                type: Number,
                required: true,
            },
        },
    ],
    // bot_messages: [botMessageSchema],
});

const Student = mongoose.model("Student", studentSchema, "Students");

module.exports = Student;
