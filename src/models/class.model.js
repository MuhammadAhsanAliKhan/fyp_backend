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

const classStudentSchema = new mongoose.Schema({
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
});

const Class = mongoose.model("Class", classSchema, "Classes");
const ClassStudent = mongoose.model(
    "ClassStudent",
    classStudentSchema,
    "ClassStudents"
);

module.exports = Class;
module.exports = ClassStudent;
