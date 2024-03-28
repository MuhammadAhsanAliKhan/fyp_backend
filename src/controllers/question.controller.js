const Question = require("../models/question.model")

const createQuestions = async (req, res) => {
    try {
        const newQuestion = new Question(req.body);
        await newQuestion.save();
        res.status(201).json({ message: 'Question created successfully', data: newQuestion, questionId: newQuestion._id });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const getQuestions = async (req, res) => {
    try {
        const questions = await Question.find();
        res.json({ message: 'Questions retrieved successfully', data: questions });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getQuestionById = async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);
        if (question) {
            res.json({ message: 'Question retrieved successfully', data: question });
        } else {
            res.status(404).json({ message: 'Question not found' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const updateQuestion = async (req, res) => {
    const { questionId, question, answer, label } = req.body;
    let updateFields = {};

    // Dynamically adding fields to updateFields object if they are provided
    if (question) updateFields.question = question;
    if (answer) updateFields.answer = answer;
    if (label) updateFields.label = label

    try {
        const result = await Question.findByIdAndUpdate(questionId,
            { $set: updateFields },
            { new: true } // Option to return the document after update
        );

        if (result) {
            res.send(`Question with ID ${questionId} has been successfully updated.`);
        } else {
            res.send('No question found with the provided ID.');
        }
    } catch (error) {
        res.status(500).send('An error occurred while updating the question.');
        console.error(error);
    }
};

const deleteQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedQuestion = await Question.findByIdAndDelete(id);
        if (deletedQuestion) {
            res.json({ message: 'Question deleted' });
        } else {
            res.status(404).json({ message: 'Question not found' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const GetFilteredQuestions = async (req, res) => {
    try {
        const { label } = req.params;
        const questions = await Question.find({ label });
        if (questions.length > 0) {
            res.json({ message: 'Questions retrieved successfully', data: questions });
        } else {
            res.status(404).json({ message: 'No questions found with the specified label' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


module.exports = {
    createQuestions,
    getQuestions,
    getQuestionById,
    updateQuestion,
    deleteQuestion,
    GetFilteredQuestions,

}