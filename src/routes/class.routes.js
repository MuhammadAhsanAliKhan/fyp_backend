const express = require("express");
const classRoutes = express.Router();
const { body, param } = require("express-validator");
const classController = require("../controllers/class.controllers");
const { extractToken, checkRole } = require("../middleware/middleware");

classRoutes
    .route("/")
    .get(extractToken, classController.classes)
    .post(extractToken, checkRole("teacher"), classController.create);

classRoutes.route("/:id").get(extractToken, classController.class_);

classRoutes.route("/:id/students").get(extractToken, classController.students);

classRoutes.route("/:id/quiz").get(extractToken, classController.quiz);

module.exports = classRoutes;
