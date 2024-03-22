const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
    is_active: {
        type: Boolean,
        required: false,
    },
    class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class",
        required: true,
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true,
    },
    rating: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
});

const Review = mongoose.model("Review", reviewSchema, "Reviews");

module.exports = Review;
