const Class = require("../models/class.model");
const ClassStudent = require("../models/class.model");
const { validationResult } = require("express-validator");

const create = async (req, res) => {
    try {
        console.log("/class");

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, teacher } = req.body;

        const class_ = new Class({
            name,
            teacher,
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

        const classes = await Class.find().populate("teacher", "name");

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

        const class_ = await Class.findById(req.params.id).populate(
            "teacher",
            "name"
        );

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
        }).populate("student", "name");

        if (!class_) {
            return res.status(404).json({ msg: "Class not found" });
        }

        res.status(200).json(class_);
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
