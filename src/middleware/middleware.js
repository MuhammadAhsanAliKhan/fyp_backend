const jwt = require("jsonwebtoken");
const Student = require("../models/student.model");
const Teacher = require("../models/teacher.model");

const extractToken = (req, res, next) => {
    try {
        console.log("Extracting token");
        const token = req.header("Authorization").split(" ")[1];
        if (!token) {
            return res
                .status(401)
                .json({ msg: "No token, authorization denied" });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.decoded = decoded;
        next();
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};

const checkRole = (role) => {
    return (req, res, next) => {
        let model;
        let msg;
        if (role === "student") {
            model = Student;
            msg = "Unauthorized: Must be student";
        } else if (role === "teacher") {
            model = Teacher;
            msg = "Unauthorized: Must be teacher";
        } else {
            return res.status(403).json({ msg: "Invalid role" });
        }

        model
            .findById(req.decoded.id)
            .then((user) => {
                if (user) {
                    next(); // User found, proceed to next middleware
                } else {
                    return res.status(403).json({ msg: "Unauthorized" });
                }
            })
            .catch((error) => {
                console.error("Error:", error);
                return res.status(500).json({ msg: "Internal Server Error" });
            });
    };
};

module.exports = { extractToken, checkRole };
