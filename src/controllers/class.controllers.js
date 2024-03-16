const Class = require("../models/class.model");
const ClassStudent = require("../models/classStudent.model");
const Quiz = require("../models/quiz.model");
const Review = require("../models/review.model");
const { validationResult } = require("express-validator");

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
            const lstudents = await ClassStudent.find({
                student: id,
            }).populate("class", "name");
            // class object for each student
            classes = await Promise.all(
                lstudents.map(async (lstudent) => {
                    const class_ = await Class.findById(
                        lstudent.class._id
                    ).populate("teacher", "name");
                    return class_;
                })
            );
        }
        // add number of quiz created and released to each class
        // release quiz if the current date is greater than the open_time
        // remove quiz array from each class
        for (let i = 0; i < classes.length; i++) {
            const students = await ClassStudent.find({ class: classes[i]._id });
            classes[i] = {
                ...classes[i]._doc,
                quizz_created: classes[i].quizzes.length,
                quizz_released: classes[i].quizzes.filter(
                    (quiz) => quiz.open_time < new Date()
                ).length,
                students: students.length,
            };
            delete classes[i].quizzes;
            delete classes[i].description;
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

        let class_ = await Class.findById(req.params.id).populate(
            "teacher",
            "name"
        );

        const student = await ClassStudent.find({ class: req.params.id });
        const enrolled = student.length;

        class_ = {
            ...class_._doc,
            enrolled,
        };

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

        const class_ = await ClassStudent.find({
            class: req.params.id,
        }).populate("student", "name email");

        // output only student name and email
        const students = class_.map((student) => {
            return {
                id: student.student._id,
                name: student.student.name,
                email: student.student.email,
            };
        });

        if (!class_) {
            return res.status(404).json({ msg: "Class not found" });
        }

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
