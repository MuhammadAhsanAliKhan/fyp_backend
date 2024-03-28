const express = require("express");
const questionRoute = express.Router();
const { body, param } = require("express-validator");
const questionController = require("../controllers/question.controller");
const { extractToken, checkRole } = require("../middleware/middleware");

questionRoute.post("createQuestion", questionController.createQuestions);

questionRoute.get('/getQuestion', questionController.getQuestions);

questionRoute.get('/getByID/:id', questionController.getQuestions);

questionRoute.put('/updateQuestion/:id', questionController.getQuestionById);

questionRoute.delete('/deleteQuestion/:id', questionController.deleteQuestion);

questionRoute.get('/label/:label', questionController.GetFilteredQuestions);

questionRoute.get('/unique-labels', questionController.GetUnqiueLabels);




