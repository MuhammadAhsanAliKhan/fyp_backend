const Question = require("../models/question.model")
const QuizModel = require("../models/quiz.model");
const { TextServiceClient } = require("@google-ai/generativelanguage").v1beta2;
const { GoogleAuth } = require("google-auth-library");
const API_KEY = "AIzaSyBRFV-0-X1GUKduLCPONzZusXaHLFihR3o"; // Your Google API Key
const MODEL_NAME = "models/text-bison-001";

const client = new TextServiceClient({
    authClient: new GoogleAuth().fromAPIKey(API_KEY),
});

const generateQuestion = async (req, res) => {
    const { inputText, true_grade, numQuestions } = req.body;

    const prompt = `Generate ${numQuestions} questions (complex) where each question is worth ${true_grade} marks about Data Mining from the given text. Provide answers based on the concepts mentioned in the text. Ensure your output is in JSON format with the fields 'Question(n)' (containing the question and 'n' tells which question it is), 'Answer(n)' (the answer derived from the text concepts and 'n' tells which answer it is), and 'Label' (indicating the subtopic of the question and 'n' tells which Label it is). Note that the marks assigned to the questions indicate the complexity of the answers, with higher marks implying a deeper exploration of unique concepts.
    \`\`\`
    ${inputText}
    \`\`\`
    `;

    try {
        const result = await client.generateText({
            model: MODEL_NAME,
            prompt: {
                text: prompt,
            },
        });


        // Save the extracted information into variables or do further processing as needed
        // Parse the JSON result and extract information

        const parsedResult = JSON.parse(JSON.stringify(result));
        console.log(parsedResult[0]?.candidates[0]?.output);
        const output = parsedResult[0]?.candidates[0]?.output;


        if (output) {
            const questioner1 = output.split('"Question(1)": "')[1].split('",\n')[0];
            const answer1 = output.split('"Answer(1)": "')[1].split('",\n')[0];
            const labeler1 = output.split('"Label(1)": "')[1].split('"\n')[0];

            const questioner2 = output.split('"Question(2)": "')[1].split('",\n')[0];
            const answer2 = output.split('"Answer(2)": "')[1].split('",\n')[0];
            const labeler2 = output.split('"Label(2)": "')[1].split('"\n')[0];

            const questioner3 = output.split('"Question(3)": "')[1].split('",\n')[0];
            const answer3 = output.split('"Answer(3)": "')[1].split('",\n')[0];
            const labeler3 = output.split('"Label(3)": "')[1].split('"\n')[0];

            // Create instances of Question using the extracted information
            const newQuestion1 = new Question({
                question: questioner1,
                answer: answer1,
                true_grade: true_grade,
                label: labeler1,
            });

            const newQuestion2 = new Question({
                question: questioner2,
                answer: answer2,
                true_grade: true_grade, // Assuming true_grade is the same for all questions
                label: labeler2,
            });

            const newQuestion3 = new Question({
                question: questioner3,
                answer: answer3,
                true_grade: true_grade, // Assuming true_grade is the same for all questions
                label: labeler3,
            });

            // Return the newly created questions as JSON
            res.json([newQuestion1, newQuestion2, newQuestion3]);
        } else {
            res.status(500).json({ error: 'No output found in the result.' });
        }

    } catch (error) {
        res.status(500).json({ error: 'An error occurred while generating questions.' });
    }
};


const createQuestions = async (req, res) => {
    try {
        const newQuestion = new Question(req.body);
        await newQuestion.save();
        res.status(201).json({ message: 'Question created successfully', data: newQuestion, questionId: newQuestion._id });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const createQuestionsByQuizId = async (req, res) => {
    try {
        console.log("createQuestion");
        const { quizId, question, answer } = req.body;
        console.log("QuizId", quizId);
        console.log("Question", question);
        console.log("Answer", answer);
        const newQuestion = new Question({ question: question, answer: answer });

        // Find the quiz by ID and update it
        const quiz = await QuizModel.findById(quizId);
        if (quiz) {
            await newQuestion.save();
            quiz.questions.push(newQuestion);
            await quiz.save();
        } else {
            return res.status(404).json({ message: "Quiz not found" });
        }

        res.status(201).json({
            message: 'Question created and added to quiz successfully',
            data: newQuestion,
            questionId: newQuestion._id
        });
    } catch (err) {
        console.log(err);
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
    const { questionId, question, answer, label, true_grade } = req.body;
    console.log("QuestionId", questionId);
    let updateFields = {};

    // Dynamically adding fields to updateFields object if they are provided
    if (question) updateFields.question = question;
    if (answer) updateFields.answer = answer;
    if (label) updateFields.label = label;
    if (true_grade) updateFields.true_grade = true_grade;

    try {
        const result = await Question.findByIdAndUpdate(questionId,
            { $set: updateFields },
            { new: true } // Option to return the document after update
        );

        console.log("fdsknjdskgnlvjdfbnvjlkfdsbvfdsnvlkjsdfnvljksdfnvklj");
        if (result) {
            res.status(200).send(`Question with ID ${questionId} has been successfully updated.`);
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

const GetUnqiueLabels = async (req, res) => {
    try {
        const uniqueLabels = await Question.distinct('label');
        res.json({ labels: uniqueLabels });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch unique labels' });
    }
};

const getQuestionsByQuizId = async (req, res) => {
    try {
        console.log("in question");
        const quizId = req.params.quizId;
        // const quizId = "66029e2d3757a0ead322ebb6";
        const response = await QuizModel.findById(quizId).populate({
            path: 'questions',
            model: 'Question', // Make sure this matches the name you've given your questions model
        });

        if (!response) {
            return res.status(404).send('Quiz not found');
        }
        console.log(response.questions);

        res.status(200).send({ questions: response.questions });
    } catch (error) {
        console.error('Error fetching questions for quiz:', error);
        res.status(500).send('Internal Server Error');
    }
};


module.exports = {
    createQuestions,
    getQuestions,
    getQuestionById,
    updateQuestion,
    deleteQuestion,
    GetFilteredQuestions,
    GetUnqiueLabels,
    generateQuestion,
    getQuestionsByQuizId,
    createQuestionsByQuizId,
}