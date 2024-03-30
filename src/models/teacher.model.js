const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema({
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
    // class reference ayega yahan, aik teacher multiple classes parha sakta hai.
});

const Teacher = mongoose.model("Teacher", teacherSchema, "Teachers");

module.exports = Teacher;
