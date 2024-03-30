const Class = require("../models/class.model");
// const ClassStudent = require("../models/classStudent.model");
const Quiz = require("../models/quiz.model");
const Review = require("../models/review.model");
const Teacher = require("../models/teacher.model");
const { validationResult } = require("express-validator");
const Student = require("../models/student.model");

const createClass = async (req, res) => {
    try {
        console.log("/class");

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        role = req.decoded.role;
        id = req.decoded.id;

        if (role !== "teacher") {
            return res.status(403).json({ msg: "Forbidden" });
        }

        const teacher = id;

        const { name, description } = req.body;

        // 4 digit random number
        const join_code = Math.floor(1000 + Math.random() * 9000);

        const class_ = new Class({
            course_name: name,
            teacher,
            description,
            join_code,
            quizCreated: 0,
            quizReleased: 0,
            studentEnrolledCount: 0,
        });

        await class_.save();

        // add class to teacher classes
        const teacher_ = await Teacher.findById(teacher);
        teacher_.classes.push(class_._id);
        await teacher_.save();

        res.status(201).json({ msg: "Class created successfully" });
    } catch (error) {
        console.log("err:", error);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};

const getClasses = async (req, res) => {
    try {
        console.log("/class");

        role = req.decoded.role;
        id = req.decoded.id;

        let classes;
        if (role === "teacher") {
            classes = await Class.find({ teacher: id });
        } else {
            // find all classes where the student is enrolled
            const students = await Student.findById(id);
            classes = students.classes;
            classes = await Class.find({ _id: { $in: classes } });
        }
        console.log(classes);

        res.status(200).json(classes);
    } catch (error) {
        console.log("err:", error);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};

const getClass = async (req, res) => {
    try {
        console.log("/class/:id");

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        let class_ = await Class.findById(req.params.id)
            .populate("teacher", "name email profile_picture")
            .populate("students", "name email erp profile_picture")
            .populate("quizzes", "title");

        if (!class_) {
            return res.status(404).json({ msg: "Class not found" });
        }

        res.status(200).json(class_);
    } catch (error) {
        console.log("err:", error);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};

// delete class
const deleteClass = async (req, res) => {
    try {
        console.log("/class/:id");

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        role = req.decoded.role;
        id = req.decoded.id;

        if (role !== "teacher") {
            return res.status(403).json({ msg: "Forbidden" });
        }

        const class_ = await Class.findById(req.params.id);

        if (!class_) {
            return res.status(404).json({ msg: "Class not found" });
        }

        // remove class from teacher classes
        const teacher = await Teacher.findById(class_.teacher);
        teacher.classes = teacher.classes.filter(
            (classId) => classId.toString() !== req.params.id
        );
        await teacher.save();

        // remove class from all students classes
        const students = await Student.find({ classes: req.params.id });
        for (let i = 0; i < students.length; i++) {
            students[i].classes = students[i].classes.filter(
                (classId) => classId.toString() !== req.params.id
            );
            await students[i].save();
        }

        // remove all quizzes of the class
        await Quiz.deleteMany({ class: req.params.id });

        // remove all reviews of the class
        await Review.deleteMany({ class: req.params.id });

        await Class.findByIdAndDelete(req.params.id);

        res.status(200).json({ msg: "Class deleted successfully" });
    } catch (error) {
        console.log("err:", error);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};

const getClassStudents = async (req, res) => {
    try {
        console.log("/class/:id/students");

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const class_ = await Class.findById(req.params.id).populate(
            "students",
            "name email classes profile_picture erp"
        );

        console.log("class:", class_);

        if (!class_) {
            return res.status(404).json({ msg: "Class not found" });
        }

        const students = class_.students.map((student) => student);
        console.log("students:", students);

        studentEnrolledCount = class_.studentEnrolledCount;

        res.status(200).json({ studentEnrolledCount, students });
    } catch (error) {
        console.log("err:", error);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};

// remove student from a class
const removeStudent = async (req, res) => {
    try {
        console.log("/class/:id/students/:studentId");

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        role = req.decoded.role;
        id = req.decoded.id;

        if (role !== "teacher") {
            return res.status(403).json({ msg: "Forbidden" });
        }

        const class_ = await Class.findById(req.params.id);

        if (!class_) {
            return res.status(404).json({ msg: "Class not found" });
        }

        const student = await Student.findById(req.params.studentId);

        if (!student) {
            return res.status(404).json({ msg: "Student not found" });
        }

        if (!student.classes.includes(req.params.id)) {
            return res
                .status(400)
                .json({ msg: "Student not enrolled in class" });
        }

        if (!class_.students.includes(req.params.studentId)) {
            return res.status(400).json({ msg: "Student not in class" });
        }

        if (class_.teacher.toString() !== id) {
            return res.status(403).json({ msg: "Forbidden incorrect teacher" });
        }

        // remove class from student classes
        student.classes = student.classes.filter(
            (classId) => classId.toString() !== req.params.id
        );
        await student.save();

        // remove student from class students
        class_.students = class_.students.filter(
            (studentId) => studentId.toString() !== req.params.studentId
        );

        // update studentEnrolledCount in class
        class_.studentEnrolledCount -= 1;

        await class_.save();

        res.status(200).json({ msg: "Student removed from class" });
    } catch (error) {
        console.log("err:", error);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};

const getClassQuizzes = async (req, res) => {
    try {
        console.log("/class/:id/quiz");

        const class_ = await Class.findById(req.params.id).populate(
            "quizzes",
            "name"
        );

        if (!class_) {
            return res.status(404).json({ msg: "Class not found" });
        }

        res.status(200).json(class_.quizzes);
    } catch (error) {
        console.log("err:", error);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};

module.exports = {
    createClass,
    getClasses,
    getClass,
    deleteClass,
    getClassStudents,
    removeStudent,
    getClassQuizzes,
};
