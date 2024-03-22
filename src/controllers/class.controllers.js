const Class = require("../models/class.model");
// const ClassStudent = require("../models/classStudent.model");
const Quiz = require("../models/quiz.model");
const Review = require("../models/review.model");
const { validationResult } = require("express-validator");
const Student = require("../models/student.model");

const create = async (req, res) => {
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
            name,
            teacher,
            description,
            join_code,
        });

        await class_.save();

        res.status(201).json({ msg: "Class created successfully" });
    } catch (error) {
        console.log("err:", error);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};

const classes = async (req, res) => {
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
        // add number of quiz created and released and enrolled number to each class
        // release quiz is quiz if the current date is greater than the open_time
        // remove quiz array, description, studentss from each class
        for (let i = 0; i < classes.length; i++) {
            classes[i] = {
                ...classes[i]._doc,
                quizz_created: classes[i].quizzes.length,
                quizz_released: classes[i].quizzes.filter(
                    (quiz) => quiz.open_time < new Date()
                ).length,
                enrolled: classes[i].students.length,
            };
            delete classes[i].quizzes;
            delete classes[i].description;
            delete classes[i].students;
        }

        res.status(200).json(classes);
    } catch (error) {
        console.log("err:", error);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};

const class_ = async (req, res) => {
    try {
        console.log("/class/:id");

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        let class_ = await Class.findById(req.params.id)
            .populate("teacher", "name email")
            .populate("students", "name email");

        if (!class_) {
            return res.status(404).json({ msg: "Class not found" });
        }

        res.status(200).json(class_);
    } catch (error) {
        console.log("err:", error);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};

const students = async (req, res) => {
    try {
        console.log("/class/:id/students");

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const class_ = await Class.findById(req.params.id).populate(
            "students",
            "name email classes"
        );

        console.log("class:", class_);

        if (!class_) {
            return res.status(404).json({ msg: "Class not found" });
        }

        const students = class_.students.map((student) => student);
        console.log("students:", students);

        res.status(200).json(students);
    } catch (error) {
        console.log("err:", error);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};

const quiz = async (req, res) => {
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

module.exports = { create, classes, class_, students, quiz };
