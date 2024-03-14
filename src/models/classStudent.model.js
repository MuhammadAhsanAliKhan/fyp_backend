const mongoose = require("mongoose");

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

const ClassStudent = mongoose.model(
    "ClassStudent",
    classStudentSchema,
    "ClassStudents"
);

module.exports = ClassStudent;
