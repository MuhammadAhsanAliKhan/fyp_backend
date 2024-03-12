const express = require("express");
const teacherRoutes = express.Router();
const { body, param } = require("express-validator");
const teacherController = require("../controllers/teacher.controllers");
const { extractToken } = require("../middleware/middleware");

teacherRoutes
    .route("/signUp")
    .post(
        [body("email").isEmail(), body("password").isLength({ min: 5 })],
        teacherController.signUp
    );

teacherRoutes
    .route("/profile")
    .get(extractToken, teacherController.profile)
    .put(
        extractToken,
        [body("name").isString(), body("age").isNumeric()],
        teacherController.updateProfile
    );

module.exports = teacherRoutes;
