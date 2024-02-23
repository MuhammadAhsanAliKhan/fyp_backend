const { Teacher } = require("../models/teacher.model");
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

        const { email, password, name, age } = req.body;

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
        });
        await teacher.save();

        res.status(201).json({ msg: "User created successfully" });
    } catch (error) {
        res.status(500).json({ msg: "Internal Server Error", error });
    }
};

const signIn = async (req, res) => {
    try {
        console.log("teacher/signIn");

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        const teacher = await Teacher.findOne({ email });
        if (!teacher) {
            return res
                .status(401)
                .json({ errors: [{ msg: "Invalid credentials" }] });
        }

        const isMatch = await bcrypt.compare(password, teacher.password);
        if (!isMatch) {
            return res
                .status(401)
                .json({ errors: [{ msg: "Invalid credentials" }] });
        }

        const token = jwt.sign({ id: teacher._id }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });

        res.status(200).json({ msg: "User signed in successfully", token });
    } catch (error) {
        res.status(500).json({ msg: "Internal Server Error" });
    }
};

module.exports = { signUp, signIn };
