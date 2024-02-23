const express = require("express");
const teacherRoutes = express.Router();
const { body, param } = require("express-validator");
const teacherController = require("../controllers/teacher.controllers");

teacherRoutes
    .route("/signUp")
    .post(
        [body("email").isEmail(), body("password").isLength({ min: 5 })],
        teacherController.signUp
    );

teacherRoutes
    .route("/signIn")
    .post(
        [body("email").isEmail(), body("password").isLength({ min: 5 })],
        teacherController.signIn
    );

module.exports = teacherRoutes;
