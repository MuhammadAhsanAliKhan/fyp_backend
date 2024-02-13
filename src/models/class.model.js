const mongoose = require("mongoose");

const classSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    students: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
        },
    ],
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Teacher",
        required: true,
    },
    quizzes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Quiz",
        },
    ],
});

const Class = mongoose.model("Class", classSchema, "Classes");

module.exports = Class;
