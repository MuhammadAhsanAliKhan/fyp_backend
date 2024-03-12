const express = require("express");
const loginRoutes = express.Router();
const { body, param, validationResult } = require("express-validator");
const { extractToken } = require("../middleware/middleware");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Teacher = require("../models/teacher.model");
const Student = require("../models/student.model");

loginRoutes
    .route("/signIn")
    .post(
        [body("email").isEmail(), body("password").isLength({ min: 5 })],
        async (req, res) => {
            try {
                console.log("/signIn");

                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                    return res.status(400).json({ errors: errors.array() });
                }

                const { email, password } = req.body;

                console.log("----", req.body);

                const teacher = await Teacher.findOne({ email });
                const student = await Student.findOne({ email });
                let pass;
                let role;
                let _id;
                if (teacher) {
                    pass = teacher.password;
                    role = "teacher";
                    _id = teacher._id;
                } else if (student) {
                    pass = student.password;
                    role = "student";
                    _id = student._id;
                } else {
                    return res
                        .status(401)
                        .json({ errors: [{ msg: "Invalid credentials" }] });
                }

                console.log("----", role, pass);

                const isMatch = await bcrypt.compare(password, pass);
                if (!isMatch) {
                    return res
                        .status(401)
                        .json({ errors: [{ msg: "Invalid credentials" }] });
                }

                console.log("Signing token");

                const token = jwt.sign({ id: _id }, process.env.JWT_SECRET, {
                    expiresIn: "1h",
                });

                console.log("Token signed");

                res.status(200).json({
                    msg: "User signed in successfully",
                    role,
                    token,
                });
            } catch (error) {
                res.status(500).json({ msg: "Internal Server Error" });
            }
        }
    );

module.exports = loginRoutes;
