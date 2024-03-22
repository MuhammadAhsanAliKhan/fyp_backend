const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema({
    //this is name
    title: {
        type: String,
        required: true,
    },
    questions: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Question",
        },
    ],
    // Quiz released at this time
    start_time: {
        type: DateTime,
        required: true,
    },
    // is time quiz khatam hogya
    end_time: {
        type: DateTime,
        required: true,
    },
    // this is for status
    is_active: {
        type: Boolean,
        required: true,
    },
    is_relesead: {
        type: Boolean,
        required: true,
    },
    //Adding Course reference because i need to tell next quiz is of which course
    class:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class",
    },
});

const Quiz = mongoose.model("Quiz", quizSchema, "Quizzes");

module.exports = Quiz;
