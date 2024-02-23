const { Student } = require("../models/student.model");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

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
        res.status(500).json({ msg: "Internal Server Error" });
    }
};

const signIn = async (req, res) => {
    try {
        console.log("student/signIn");

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        const student = await Student.findOne({ email });
        if (!student) {
            return res
                .status(401)
                .json({ errors: [{ msg: "Invalid credentials" }] });
        }

        const isMatch = await bcrypt.compare(password, student.password);
        if (!isMatch) {
            return res
                .status(401)
                .json({ errors: [{ msg: "Invalid credentials" }] });
        }

        const payload = {
            user: {
                id: student.id,
            },
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: 360000 },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );
    } catch (error) {
        res.status(500).json({ msg: "Internal Server Error" });
    }
};

module.exports = { signUp, signIn };
