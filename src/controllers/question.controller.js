const Question = require("../models/question.model")
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

const GetUnqiueLabels =async (req, res) => {
    try {
      const uniqueLabels = await Question.distinct('label');
      res.json({ labels: uniqueLabels });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch unique labels' });
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

}