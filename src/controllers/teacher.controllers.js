const Teacher = require("../models/teacher.model");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const signUp = async (req, res) => {
    try {
        console.log("teacher/signUp");

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password, name, age, profile_picture } = req.body;
        const file = profile_picture;

        console.log("----", req.body);
        const existingUser = await Teacher.findOne({ email });
        console.log("----", existingUser);
        if (existingUser) {
            return res.status(409).json({ msg: "User already exists" });
        }
        console.log("Creating new user");
        const hashedPassword = await bcrypt.hash(password, 10);
        const teacher = new Teacher({
            email,
            password: hashedPassword,
            name,
            age,
            profile_picture: {
                filename: file.filename,
                path: file.path,
            },
        });
        await teacher.save();

        res.status(201).json({ msg: "User created successfully" });
    } catch (error) {
        res.status(500).json({ msg: "Internal Server Error" });
    }
};

const profile = async (req, res) => {
    try {
        console.log("teacher/profile");

        const teacher = await Teacher.findById(req.decoded.id).select(
            "-password"
        );

        console.log("teacher", teacher);
        res.status(200).json({ teacher });
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};

const updateProfile = async (req, res) => {
    try {
        console.log("teacher/updateProfile");

        let teacher = await Teacher.findById(req.decoded.id).select(
            "-password"
        );

        if (!teacher) {
            return res.status(404).json({ msg: "User not found" });
        }

        let updateFields = {};
        if (req.body.name) updateFields.name = req.body.name;
        if (req.body.age) updateFields.age = req.body.age;
        if (req.body.profile_picture) {
            updateFields.profile_picture = {
                filename: req.file.filename,
                path: req.file.path,
            };
        }

        teacher = await Teacher.findByIdAndUpdate(
            req.decoded.id,
            updateFields,
            {
                new: true,
            }
        ).select("-password");

        res.status(200).json({ teacher });
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};

module.exports = { signUp, profile, updateProfile };
