const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema({
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
    open_time: {
        type: Date,
        required: true,
    },
    close_time: {
        type: Date,
        required: true,
    },
    is_active: {
        type: Boolean,
        required: true,
    },
});
