const express = require("express");
const authRoutes = express.Router();
const { body, param } = require("express-validator");
const authController = require("../controllers/auth.controllers");

authRoutes
    .route("/signUp")
    .post(
        [body("email").isEmail(), body("password").isLength({ min: 5 })],
        authController.signUp
    );

authRoutes
    .route("/signIn")
    .post(
        [body("email").isEmail(), body("password").isLength({ min: 5 })],
        authController.signIn
    );

module.exports = authRoutes;
