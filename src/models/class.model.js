const mongoose = require("mongoose");

const classSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    // students: [
    //     {
    //         type: mongoose.Schema.Types.ObjectId,
    //         ref: "Student",
    //     },
    // ],
    description: {
        type: String,
        required: true,
        default: "",
    },
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
    avg_rating: {
        type: Number,
        required: false,
        default: 0,
    },
    join_code: {
        type: Number,
        required: true,
    },
});

const Class = mongoose.model("Class", classSchema, "Classes");

module.exports = Class;
