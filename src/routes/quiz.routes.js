const express = require("express");
const quizRoutes = express.Router();
const { body, param } = require("express-validator");
const quizController = require("../controllers/quiz.controller");
const { extractToken, checkRole } = require("../middleware/middleware");

quizRoutes.post('/createQuiz', createQuiz);

// GET route to fetch quizzes by class ID
quizRoutes.get('/quizzesByClass/:class_id', extractToken, quizController.getQuizzesByClass);

// DELETE route to delete a quiz by its ID
quizRoutes.delete('/deleteQuiz/:quizId', extractToken, quizController.deleteQuiz);

// POST route to get the most recent quiz for a student
quizRoutes.post('/recentQuizForStudent', extractToken, quizController.getRecentQuizForStudent);

// POST route to get the most recent quiz for a teacher
quizRoutes.post('/recentQuizForTeacher', extractToken, quizController.getRecentQuizForTeacher);

// POST route to get the next quiz for a student
quizRoutes.post('/nextQuizForStudent', extractToken, quizController.getNextQuizForStudent);

// POST route to get the next quiz for a teacher
quizRoutes.post('/nextQuizForTeacher',extractToken, quizController.getNextQuizForTeacher);

module.exports = quizRoutes;