const express = require("express");
const quizRoutes = express.Router();
const { body, param } = require("express-validator");
const quizController = require("../controllers/quiz.controller");
const { extractToken, checkRole } = require("../middleware/middleware");

quizRoutes.route("/createQuiz").post(quizController.createQuiz);

// GET route to fetch quizzes by class ID
quizRoutes.route("/quizzesByClass").get(quizController.getQuizzesByClass);

// DELETE route to delete a quiz by its ID
quizRoutes.route("/deleteQuiz").delete(quizController.deleteQuiz);

// POST route to get the most recent quiz for a student
quizRoutes
    .route("/recentQuizForStudent")
    .post(quizController.getRecentQuizForStudent);

// POST route to get the most recent quiz for a teacher
quizRoutes
    .route("/recentQuizForTeacher")
    .post(quizController.getRecentQuizForTeacher);

// POST route to get the next quiz for a student
quizRoutes
    .route("/nextQuizForStudent")
    .post(quizController.getNextQuizForStudent);

// POST route to get the next quiz for a teacher
quizRoutes
    .route("/nextQuizForTeacher")
    .post(quizController.getNextQuizForTeacher);

quizRoutes.route("/activateQuiz").put(quizController.activateQuiz);

quizRoutes.route("/deactivateQuiz").put(quizController.deactivateQuiz);

// POST route to submit a quiz and grade all answers through Flask API
quizRoutes
    .route("/submit/:quiz_id")
    .post(extractToken, quizController.submitQuiz);

// POST route to get the quiz results of student for teacher view just scores no answers
quizRoutes
    .route("/:quiz_id/TeacherResults")
    .get(
        extractToken,
        checkRole("teacher"),
        quizController.getQuizResultsForTeacher
    );

// POST route to get the quiz results of student for student view with answers
quizRoutes
    .route("/:quiz_id/studentResults")
    .get(
        extractToken,
        checkRole("student"),
        quizController.getQuizResultsForStudent
    );

module.exports = quizRoutes;
