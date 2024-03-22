const QuestionModel = require("../models/question.model");
const ClassModel = require("../models/class.model");

const createQuiz = async (req, res) => {
    try {
        const { title, questions, start_time, end_time, is_active, is_relesead, class_id } = req.body;
        const classFound = await ClassModel.findById(class_id);
        if (!classFound) {
            return res.status(404).send("Class not found");
        }
        const quiz = new QuizModel({
            title,
            questions,
            start_time,
            end_time,
            is_active,
            is_relesead,
            class: class_id,
        });
        await quiz.save();
        res.status(200).send({
            message: "Quiz created successfully",
            quiz: quiz,
        });
    } catch (error) {
        res.status(400).send(error);
    }
}

const getQuizzesByClass = async (req, res) => {
    try {
        const class_id = req.params.class_id;
        const classFound = await ClassModel.findById(class_id);
        if (!classFound) {
            return res.status(404).send("Class not found");
        }
        else {
            const quizzes = await classFound.populate("quizzes").execPopulate();
            res.status(200).send(
                {
                    message: "Quizzes found successfully",
                    quizzes: quizzes
                });
        }
    }
    catch {
        res.status(400).send(error);
    }
};

const deleteQuiz = async (req, res) => {
    try {
        const quizId = req.params.quizId;
        const quiz = await QuizModel.findById({id: quizId});
        if (!quiz) {
            return res.status(404).send("Quiz not found");
        }
        if (quiz.is_released) {
            return res.status(400).send("Cannot delete a released quiz");
        }
        await QuizModel.findByIdAndDelete(quizId);
        res.status(200).send({message:"Quiz deleted successfully"});
    } catch (error) {
        res.status(400).send(error);
    }
};



// const getRecentQuiz = async (req, res) => {
//     try {
//         const { student_id } = req.body;
//         if (!student_id) {
//             return res.status(400).send("Please provide student id");
//         }
//         else {
//             const classes = await ClassModel.find({ students: student_id });
//             const quizzes = await QuizModel.find({ class: { $in: classes }, is_released: true, status: "completed", is_active: false })
//                 .sort({ end_time: -1 })
//                 .limit(1);
//             res.status(200).send({
//                 message: "Quiz found successfully",
//                 quiz: quizzes[0],
//             });
//         }
//     } catch (error) {
//         res.status(400).send(error);
//     }
// };
// const getRecentQuiz = async (req, res) => {
//     try {
//         const { class_id } = req.body;
//         if (!class_id) {
//             return res.status(400).send("Please provide class id");
//         }
//         else{
//             const quizzes = await QuizModel.find({ is_released: true, status: "completed", is_active: false, class: class_id})
//                 .sort({ $subtract: ["$end_time", new Date()] }) // yeh line masla kar sakti hai
//                 .limit(1);
//             res.status(200).send({
//                 message: "Quiz found successfully",
//                 quiz: quizzes[0],
//             });
//         }
//     } catch (error) {
//         res.status(400).send(error);
//     }
// };





module.exports = { createQuiz, getQuizzesByClass };
