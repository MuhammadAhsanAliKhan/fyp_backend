const express = require("express");
const classRoutes = express.Router();
const { body, param } = require("express-validator");
const classController = require("../controllers/class.controllers");
const { extractToken, checkRole } = require("../middleware/middleware");

classRoutes
    .route("/")
    .get(extractToken, classController.getClasses)
    .post(extractToken, checkRole("teacher"), classController.createClass);

classRoutes
    .route("/:id")
    .get(extractToken, classController.getClass)
    .delete(extractToken, checkRole("teacher"), classController.deleteClass);

classRoutes
    .route("/:id/students")
    .get(extractToken, classController.getClassStudents);

// remove a student from class
classRoutes
    .route("/:id/students/:studentId")
    .delete(extractToken, checkRole("teacher"), classController.removeStudent);

classRoutes
    .route("/:id/quiz")
    .get(extractToken, classController.getClassQuizzes);

classRoutes
    .route("/api/classes/:classId/add-quiz/:quizId")
    .get(classController.getClassQuizzes);

classRoutes
    .route("/:id/reviews")
    .get(extractToken, classController.getReviews)
    .post(
        extractToken,
        checkRole("student"),
        [
            body("rating").isNumeric().notEmpty(),
            body("description").isString().notEmpty(),
        ],
        classController.leaveReview
    );

classRoutes
    .route("/:id/reviews/:reviewId")
    .delete(extractToken, checkRole("student"), classController.deleteReview);

module.exports = classRoutes;
