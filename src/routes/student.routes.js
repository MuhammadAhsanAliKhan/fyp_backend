const express = require("express");
const studentRoutes = express.Router();
const { body, param } = require("express-validator");
const studentController = require("../controllers/student.controllers");
const { extractToken, checkRole } = require("../middleware/middleware");

studentRoutes
    .route("/signUp")
    .post(
        [body("email").isEmail(), body("password").isLength({ min: 5 })],
        studentController.signUp
    );

studentRoutes
    .route("/profile")
    .get(extractToken, studentController.profile)
    .put(
        extractToken,
        [
            body("name").isString(),
            body("age").isNumeric(),
            body("cgpa").isNumeric().optional(),
            body("admission_date").isDate().optional(),
        ],
        studentController.updateProfile
    );

studentRoutes
    .route("/joinClass")
    .post(
        extractToken,
        checkRole("student"),
        [body("class_code").isString()],
        studentController.joinClass
    );

module.exports = studentRoutes;
