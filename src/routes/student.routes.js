const express = require("express");
const studentRoutes = express.Router();
const { body, param } = require("express-validator");
const studentController = require("../controllers/student.controllers");

studentRoutes
    .route("/signUp")
    .post(
        [body("email").isEmail(), body("password").isLength({ min: 5 })],
        studentController.signUp
    );

studentRoutes
    .route("/signIn")
    .post(
        [body("email").isEmail(), body("password").isLength({ min: 5 })],
        studentController.signIn
    );

module.exports = studentRoutes;
