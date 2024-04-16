const express = require("express");
const questionRoute = express.Router();
const { body, param } = require("express-validator");
const questionController = require("../controllers/question.controller");
const { extractToken, checkRole } = require("../middleware/middleware");

questionRoute
.route("/createQuestion").post(questionController.createQuestions);

questionRoute.route('/getQuestion').get(questionController.getQuestions);

questionRoute.route('/getByID/:id').get(questionController.getQuestionById);

questionRoute.route('/updateQuestion/:id').put(questionController.updateQuestion);

questionRoute.route('/deleteQuestion/:id').delete(questionController.deleteQuestion);

questionRoute.route('/label/:label').get(questionController.GetFilteredQuestions);

questionRoute.get('/unique-labels', questionController.GetUnqiueLabels);

questionRoute.post('/generateQuestions', questionController.generateQuestion);

questionRoute.route('/getQuestionsByQuizId/:quizId').get(questionController.getQuestionsByQuizId);

module.exports = questionRoute;
