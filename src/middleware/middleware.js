const jwt = require("jsonwebtoken");
const Student = require("../models/student.model");
const Teacher = require("../models/teacher.model");

const extractToken = (req, res, next) => {
    try {
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
        res.status(500).json({ msg: "Internal Server Error" });
    }
};

const checkRole = (role) => {
    return (req, res, next) => {
        const student = Student.findById(req.decoded.id);
        const teacher = Teacher.findById(req.decoded.id);
        if (role === "student" && !student) {
            return res.status(403).json({ msg: "Forbidden" });
        }
        if (role === "teacher" && !teacher) {
            return res.status(403).json({ msg: "Forbidden" });
        }

        next();
    };
};

module.exports = { extractToken, checkRole };
