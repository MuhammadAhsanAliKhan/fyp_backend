const mongoose = require("mongoose");

const responseSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true,
    },
    student_answer: {
        type: String,
        required: false, // student can submit without answering all questions
    },
    grade: {
        type: Number,
        required: false,
    },
    word2vec_score: {
        type: mongoose.Types.Decimal128,
        required: false,
        default: 0,
    },
    rouge_score: {
        type: mongoose.Types.Decimal128,
        required: false,
        default: 0,
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
        deault: 0,
    },
    label: {
        type: String,
        default: "",
    },

    responses: [responseSchema],
});

const Question = mongoose.model("Question", questionSchema, "Questions");

module.exports = Question;
