const QuestionModel = require("../models/question.model");
const ClassModel = require("../models/class.model");
const QuizModel = require("../models/quiz.model");

const createQuiz = async (req, res) => {
  try {
    const { title, questions, start_time, end_time, is_active, is_relesead, class_id } = req.body;
    const classFound = await ClassModel.findById(class_id);
    if (!classFound) {
      return res.status(404).send("Class not found");
    }
    const quiz = await new QuizModel({
      title,
      questions,
      start_time,
      end_time,
      is_active,
      is_relesead,
      class: class_id,
    });

    console.log("quiz created");
    const updatedClass = await ClassModel.findByIdAndUpdate(class_id, {
      $push: { quizzes: quiz._id }
    });
    console.log("class updated");

    if (!updatedClass) {
      return res.status(404).send('The class with the given ID was not found.');
    }

    await quiz.save();


    res.status(200).json({
      message: "Quiz created successfully",
      quiz: quiz,
    });
  } catch (error) {
    res.status(400).send(error);
  }
}

const getQuizzesByClass = async (req, res) => {
  try {
    const { class_id } = req.body;
    const classFound = await ClassModel.findById(class_id);
    if (!classFound) {
      return res.status(404).send("Class not found");
    }
    else {
      console.log("Class mil gayi");
      const quizzes = await classFound.populate("quizzes");
      console.log(quizzes);
      res.status(200).json(
        {
          message: "Quizzes found successfully",
          quizzes: quizzes
        });
    }
  }
  catch (error) {
    res.status(400).send(error);
  }
};


const deleteQuiz = async (req, res) => {
  try {
    const { quizId } = req.body;
    const quiz = await QuizModel.findById({ _id: quizId });
    if (!quiz) {
      return res.status(404).send("Quiz not found");
    }
    if (quiz.is_released) {
      return res.status(400).send("Cannot delete a released quiz");
    }
    await QuizModel.findByIdAndDelete(quizId);
    res.status(200).send({ message: "Quiz deleted successfully" });
  } catch (error) {
    res.status(400).send(error);
  }
};


const getRecentQuizForStudent = async (req, res) => {
  try {
    const { student_id } = req.body;
    if (!student_id) {
      return res.status(400).send("Student ID is required");
    }

    // Find the classes the student is enrolled in
    const classes = await ClassModel.find({ students: student_id });
    if (classes.length === 0) {
      return res.status(404).send("Student not found in any classes");
    }

    const classIds = classes.map(c => c._id);
    const currentTime = new Date();

    // Find quizzes that meet the conditions and are closest to the current time
    const recentQuiz = await Quiz.aggregate([
      {
        $match: {
          class: { $in: classIds },
          is_relesead: true,
          status: "completed",
          is_active: false,
          end_time: { $lte: currentTime }
        }
      },
      {
        $project: {
          class: 1,
          title: 1,
          start_time: 1,
          end_time: 1,
          timeDifference: { $abs: { $subtract: ["$end_time", currentTime] } }
        }
      },
      { $sort: { timeDifference: 1 } },
      { $limit: 1 }
    ]).exec();

    if (recentQuiz.length === 0) {
      return res.status(404).send("No recent quizzes found for the student.");
    }

    res.status(200).json({
      message: "Recent quiz found successfully",
      quiz: recentQuiz[0]
    });
  } catch (error) {
    console.error('Failed to fetch the recent quiz for student:', error);
    res.status(500).send('Internal server error');
  }
};

const getRecentQuizForTeacher = async (req, res) => {
  try {
    const { teacher_id } = req.body;
    if (!teacher_id) {
      return res.status(400).send("Teacher ID is required");
    }

    // Find classes taught by the teacher
    const classes = await ClassModel.find({ teacher: teacher_id });
    if (!classes.length) {
      return res.status(404).send("Teacher not found teaching any classes");
    }

    const classIds = classes.map(c => c._id);
    const currentTime = new Date();

    // Find quizzes that meet the conditions and are closest to the current time
    const recentQuiz = await Quiz.aggregate([
      {
        $match: {
          class: { $in: classIds },
          is_relesead: true,
          status: "completed",
          is_active: false,
          end_time: { $lte: currentTime }
        }
      },
      {
        $project: {
          class: 1,
          title: 1,
          start_time: 1,
          end_time: 1,
          timeDifference: { $abs: { $subtract: ["$end_time", currentTime] } }
        }
      },
      { $sort: { timeDifference: 1 } },
      { $limit: 1 }
    ]).exec();

    if (recentQuiz.length === 0) {
      return res.status(404).send("No recent quizzes found for the teacher's classes.");
    }

    res.status(200).json({
      message: "Recent quiz found successfully",
      quiz: recentQuiz[0]
    });
  } catch (error) {
    console.error('Failed to fetch the recent quiz for teacher:', error);
    res.status(500).send('Internal server error');
  }
};



const getNextQuizForStudent = async (req, res) => {
  try {
    const { student_id } = req.body;
    if (!student_id) {
      return res.status(400).send("Student ID is required");
    }

    // Find the classes the student is enrolled in
    const classes = await ClassModel.find({ students: student_id });
    console.log("Classes", classes);
    if (!classes.length) {
      return res.status(404).send("Student not found in any classes");
    }

    // Extract class IDs for querying quizzes
    const classIds = classes.map(c => c._id);
    console.log("Class Ids", classIds);

    const currentTime = new Date();
    console.log("Current Time", currentTime);

    // Find the next quiz for these classes
    const quiz = await QuizModel.find({
      class: { $in: classIds },
      is_active: false,
      is_relesead: false, // Spelling ka masla hai sahi karna hai
    start_time: { $gt: currentTime }
        })
          .sort({ start_time: 1 }) // Ensures the closest future quiz comes first
          .limit(1);

    console.log("Quiz",quiz);

    if (!quiz.length) {
      return res.status(404).send("No next quiz found for the student.");
    }

    res.status(200).json({
      message: "Next quiz found successfully",
      quiz: quiz[0]
    });
  } catch (error) {
    console.error('Failed to fetch the next quiz for student:', error);
    res.status(500).send('Internal server error');
  }
};


const getNextQuizForTeacher = async (req, res) => {
  try {
    const { teacher_id } = req.body;
    if (!teacher_id) {
      return res.status(400).send("Teacher ID is required");
    }

    // Find the classes taught by the teacher
    const classes = await ClassModel.find({ teacher: teacher_id });
    if (!classes.length) {
      return res.status(404).send("Teacher not found teaching any classes");
    }

    // Extract class IDs for querying quizzes
    const classIds = classes.map(c => c._id);

    const currentTime = new Date();

    // Find the next quiz for these classes
    const quiz = await Quiz.find({
      class: { $in: classIds },
      is_active: false,
      is_relesead: false, // iski spelling ghalat hai
      start_time: { $gt: currentTime }
    })
      .sort({ start_time: 1 }) // Finds the closest future quiz
      .limit(1)
      .populate('Class') // Adjust based on your need to populate related data
      .populate('Question'); // For populating related questions

    if (!quiz.length) {
      return res.status(404).send("No next quiz found for the teacher's classes.");
    }

    res.status(200).json({
      message: "Next quiz found successfully",
      quiz: quiz[0]
    });
  } catch (error) {
    console.error('Failed to fetch the next quiz for teacher:', error);
    res.status(500).send('Internal server error');
  }
};

const activateQuiz = async (req, res) => {
  const { courseId, time } = req.body; // Extract courseId and time from request body
  
  try {
      const currentTime = new Date(time); // Convert time to Date object if it's not already
      
      // Find and update quizzes
      const result = await Quiz.updateMany(
          { 
              class: courseId, 
              start_time: { $gte: currentTime } 
          },
          {
              $set: { is_active: true }
          }
      );

      if(result.modifiedCount > 0) {
          res.status(200).json({Message: "Successfully updated ${result.modifiedCount} quizzes"});
      } else {
          res.send('No quizzes were updated. Please check your inputs.');
      }
  } catch (error) {
      res.status(500).send('An error occurred while updating the quizzes.');
      console.error(error);
  }
};

const deactivateQuiz = async (req, res) => {
  const { quizId } = req.body; // Extract quizId from request body

  try {
      // Find the quiz by ID and update its is_active field to false
      const result = await Quiz.findByIdAndUpdate(quizId, 
          { $set: { is_active: false } },
          { new: true } // This option returns the document after update was applied
      );

      if(result) {
          res.status(200).send(`Quiz with ID ${quizId} has been successfully deactivated.`);
      } else {
          res.send('No quiz found with the provided ID.');
      }
  } catch (error) {
      res.status(500).send('An error occurred while deactivating the quiz.');
      console.error(error);
  }
};





module.exports = {
  createQuiz,
  getQuizzesByClass,
  deleteQuiz,
  getRecentQuizForStudent,
  getRecentQuizForTeacher,
  getNextQuizForStudent,
  getNextQuizForTeacher,
  activateQuiz,
  deactivateQuiz,
};






// const getNextQuizForStudent = async (req, res) => {
//   try {
//     const { student_id } = req.body;
//     if (!student_id) {
//       return res.status(400).send("Student ID is required");
//     }

//     // Find the classes the student is enrolled in
//     const classes = await ClassModel.find({ students: student_id });
//     console.log("Classes", classes);
//     if (!classes.length) {
//       return res.status(404).send("Student not found in any classes");
//     }

//     // Extract class IDs for querying quizzes
//     const classIds = classes.map(c => c._id);
//     console.log("Class Ids", classIds);

//     const currentTime = new Date();
//     console.log("Current Time", currentTime);

//     // Find the next quiz for these classes
//     const quiz = await QuizModel.find({
//       class: { $in: classIds },
//       is_active: false,
//       is_released: false,
//       // start_time: { $gt: currentTime }
//     })
//       // .sort({ start_time: 1 }) // Ensures the closest future quiz comes first
//       // .limit(1);
//       // .populate('Class') // Adjust based on your need to populate related data
//       // .populate('Question'); // Example of populating related questions

//     if (!quiz.length) {
//       return res.status(404).send("No next quiz found for the student.");
//     }

//     res.status(200).json({
//       message: "Next quiz found successfully",
//       quiz: quiz[0]
//     });
//   } catch (error) {
//     console.error('Failed to fetch the next quiz for student:', error);
//     res.status(500).send('Internal server error');
//   }
// };