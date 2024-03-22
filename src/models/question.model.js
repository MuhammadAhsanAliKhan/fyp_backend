const mongoose = require("mongoose");

const responseSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true,
    },
    // question: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "Question",
    //     required: true,
    // },
    student_answer: {
        type: String,
        required: true,
    },
    grade: {
        type: Number,
        required: false,
    },
});

const questionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true,
    },
    answer: {
        type: String,
        required: true,
    },
    true_grade: {
        type: Number,
        required: true,
    },
    responses: [responseSchema],
});

const Question = mongoose.model("Question", questionSchema, "Questions");

module.exports = Question;
