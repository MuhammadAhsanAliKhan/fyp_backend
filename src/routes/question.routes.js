const express = require("express");
const questionRoute = express.Router();
const { body, param } = require("express-validator");
const questionController = require("../controllers/question.controller");
const { extractToken, checkRole } = require("../middleware/middleware");

questionRoute
.route("/createQuestion").post(questionController.createQuestions);

questionRoute.route('/getQuestion').get(questionController.getQuestions);

questionRoute.route('/getByID/:id').get(questionController.getQuestions);

questionRoute.route('/updateQuestion/:id').put(questionController.getQuestionById);

questionRoute.route('/deleteQuestion/:id').delete(questionController.deleteQuestion);

questionRoute.route('/label/:label').get(questionController.GetFilteredQuestions);

module.exports = questionRoute;

questionRoute.get('/unique-labels', questionController.GetUnqiueLabels);




