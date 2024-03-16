const Student = require("../models/student.model");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Class = require("../models/class.model");
// const ClassStudent = require("../models/classStudent.model");

const signUp = async (req, res) => {
    try {
        console.log("student/signUp");

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password, name, age, cgpa, admission_date } = req.body;

        console.log(req.body);

        const existingUser = await Student.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ msg: "User already exists" });
        }

        console.log("Creating new user");

        const hashedPassword = await bcrypt.hash(password, 10);
        const student = new Student({
            email,
            password: hashedPassword,
            name,
            age,
            cgpa,
            admission_date,
        });

        console.log("Saving new user", student);
        await student.save();

        res.status(201).json({ msg: "User created successfully" });
    } catch (error) {
        console.log("err:", error);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};

const profile = async (req, res) => {
    try {
        console.log("student/profile");

        let student = await Student.findById(req.decoded.id).select(
            "-password"
        );
        if (!student) {
            return res.status(404).json({ msg: "User not found" });
        }

        res.status(200).json({ msg: "Profile", student: student });
    } catch (error) {
        res.status(500).json({ msg: "Internal Server Error" });
    }
};

const updateProfile = async (req, res) => {
    try {
        console.log("student/updateProfile");

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, age, cgpa, admission_date } = req.body;

        let student = await Student.findById(req.decoded.id);
        if (!student) {
            return res.status(404).json({ msg: "User not found" });
        }

        student = await Student.findByIdAndUpdate(
            req.student.id,
            {
                name,
                age,
                cgpa,
                admission_date,
            },
            { new: true }
        ).select("-password");
        console.log("student:", student);

        res.status(200).json({ msg: "Update Profile", student: student });
    } catch (error) {
        console.log("err:", error);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};

const joinClass = async (req, res) => {
    try {
        console.log("student/joinClass");

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const join_code = req.body.class_code;

        // dont select password, email, age, cgpa
        let student = await Student.findById(req.decoded.id).select(
            "-password -email -age -cgpa"
        );
        if (!student) {
            return res.status(404).json({ msg: "User not found" });
        }

        const class_ = await Class.findOne({ join_code });
        if (!class_) {
            return res.status(404).json({ msg: "Class not found" });
        }

        // add student to array of students in class and add class to array of classes in student
        student.classes.push(class_._id);
        await student.save();

        class_.students.push(student._id);
        await class_.save();

        res.status(200).json({ msg: "Class joined", student: student });
    } catch (error) {
        console.log("err:", error);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};

module.exports = { signUp, profile, updateProfile, joinClass };
