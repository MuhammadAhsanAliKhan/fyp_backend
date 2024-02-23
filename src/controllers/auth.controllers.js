const { Teacher } = require("../models/teacher.model");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { User } = require("../models/user.model");

const signUp = async (req, res) => {
    try {
        console.log("/signUp");

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password, role } = req.body;
        if (!["student", "teacher", "admin"].includes(role)) {
            return res.status(400).json({ error: "Invalid role" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ msg: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({ email, password: hashedPassword, role });
        await newUser.save();

        res.status(201).json({ msg: "User created successfully" });
    } catch (error) {
        res.status(500).json({ msg: "Internal Server Error" });
    }
};

const signIn = async (req, res) => {
    try {
        console.log("/signIn");

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res
                .status(401)
                .json({ errors: [{ msg: "Invalid credentials" }] });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res
                .status(401)
                .json({ errors: [{ msg: "Invalid credentials" }] });
        }

        const token = jwt.sign(
            { email, role: user.role },
            process.env.JWT_SECRET,
            {
                expiresIn: "1h",
            }
        );

        res.status(200).json({ msg: "User signed in successfully", token });
    } catch (error) {
        res.status(500).json({ msg: "Internal Server Error" });
    }
};

module.exports = { signUp, signIn };
