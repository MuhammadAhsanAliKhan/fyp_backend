const QuestionModel = require("../models/question.model");
const ClassModel = require("../models/class.model");
const QuizModel = require("../models/quiz.model");
const StudentModel = require("../models/student.model");
const axios = require("axios");
const Quiz = require("../models/quiz.model");

const createQuiz = async (req, res) => {
    try {
        const {
            title,
            questions,
            start_time,
            end_time,
            is_active,
            is_relesead,
            courseId,
        } = req.body;
        const classFound = await ClassModel.findById(courseId);
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
            class: courseId,
        });

        console.log("quiz created");
        const updatedClass = await ClassModel.findByIdAndUpdate(courseId, {
            $push: { quizzes: quiz._id },
        });

        const course = await ClassModel.findById({ _id: courseId });
        if (course) {
            console.log("Course", course);
            course.quizCreated = course.quizCreated + 1;
            await course.save();
        }
        console.log("class updated");

        if (!updatedClass) {
            return res
                .status(404)
                .send("The class with the given ID was not found.");
        }

        await quiz.save();

        res.status(200).json({
            message: "Quiz created successfully",
            quiz: quiz,
        });
    } catch (error) {
        res.status(400).send(error);
    }
};

const getQuizzesByClass = async (req, res) => {
    try {
        console.log("getQuizzesByClass");
        const _id = req.decoded.id;
        const role = req.decoded.role;
        const class_id = req.params.class_id;
        let _class = await ClassModel.findById(class_id).populate("quizzes");
        if (!_class) {
            console.log("Class not found");
            return res.status(404).send("Class not found");
        } else {
            console.log("Class found");
            // for each quiz check if attempted by student
            if (role === "student") {
                console.log("Student");
                q = _class.quizzes.map((quiz) => {
                    let quizObj = quiz.toObject(); // Convert Mongoose document to plain JavaScript object

                    quizObj.is_attempted = quiz.submitted_by.includes(_id);
                    return quizObj;
                });

                _class = _class.toObject();
                _class.quizzes = q;
            }

            res.status(200).json({
                message: "Quizzes found successfully",
                class: _class,
            });
        }
    } catch (error) {
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
        const student_id = req.decoded.id;

        // Find the classes the student is enrolled in
        const classes = await ClassModel.find({ students: student_id });
        if (!classes.length) {
            return res.status(404).send("Student not found in any classes");
        }

        const classIds = classes.map((c) => c._id);
        const currentTime = new Date();
        const updatedTime = new Date(
            currentTime.getTime() + 5 * 60 * 60 * 1000
        );

        // Find quizzes that meet the conditions
        const quizzes = await QuizModel.find({
            class: { $in: classIds },
            is_relesead: true,
            // status: "completed",
            is_active: false,
            end_time: { $lte: updatedTime },
        })
            .populate("class")
            .sort({ end_time: -1 }) // Sort quizzes by end_time in descending order
            .exec();

        // Assuming the most recent quiz is the one you're looking for
        const recentQuiz = quizzes[0];

        if (!recentQuiz) {
            return res
                .status(404)
                .send("No recent quizzes found for the student.");
        }

        res.status(200).json({
            message: "Recent quiz found successfully",
            quiz: recentQuiz,
        });
    } catch (error) {
        console.error("Failed to fetch the recent quiz for student:", error);
        res.status(500).send("Internal server error");
    }
};

const getRecentQuizForTeacher = async (req, res) => {
    try {
        const teacher_id = req.decoded.id;
        // const teacher_id = "65fdc3236ba0c3264ab12c61"; // Hardcoded teacher ID for testing

        // Find classes taught by the teacher
        const classes = await ClassModel.find({ teacher: teacher_id });
        console.log("Classes", classes);
        if (!classes.length) {
            return res
                .status(404)
                .send("Teacher not found teaching any classes");
        }

        const classIds = classes.map((c) => c._id);
        console.log("ClassIds", classIds);
        const currentTime = new Date();
        const updatedTime = new Date(
            currentTime.getTime() + 5 * 60 * 60 * 1000
        );

        // Find quizzes that meet the conditions
        const quizzes = await QuizModel.find({
            class: { $in: classIds },
            is_relesead: true,
            // status: "completed",
            is_active: false,
            end_time: { $lte: updatedTime },
        })
            .populate("class")
            .sort({ end_time: -1 }) // Sort quizzes by end_time in descending order
            .exec();

        // Assuming the most recent quiz is the one you're looking for
        const recentQuiz = quizzes[0];
        console.log("Recent Quiz", recentQuiz);

        if (!recentQuiz) {
            return res
                .status(404)
                .send("No recent quizzes found for the teacher's classes.");
        }

        res.status(200).json({
            message: "Recent quiz found successfully",
            quiz: recentQuiz,
        });
    } catch (error) {
        console.error("Failed to fetch the recent quiz for teacher:", error);
        res.status(500).send("Internal server error");
    }
};

const getNextQuizForStudent = async (req, res) => {
    try {
        const student_id = req.decoded.id;

        // Find the classes the student is enrolled in
        const classes = await ClassModel.find({ students: student_id });
        console.log("Classes", classes);
        if (!classes.length) {
            return res.status(404).send("Student not found in any classes");
        }

        // Extract class IDs for querying quizzes
        const classIds = classes.map((c) => c._id);
        console.log("Class Ids", classIds);

        const currentTime = new Date();

        // Find the next quiz for these classes (Teacher ne release kardia ho but quiz active na ho)
        const quiz = await QuizModel.find({
            class: { $in: classIds },
            is_active: false,
            is_relesead: false, // Spelling ka masla hai sahi karna hai
            start_time: { $gt: currentTime },
        })
            .sort({ start_time: 1 }) // Ensures the closest future quiz comes first
            .limit(1)
            .populate("class") // Populate the class reference. Ensure 'class' is the correct path in your QuizModel schema
            .exec();

        console.log("Quiz", quiz);

        if (!quiz.length) {
            return res.status(404).send("No next quiz found for the student.");
        }

        res.status(200).json({
            message: "Next quiz found successfully",
            quiz: quiz[0],
        });
    } catch (error) {
        console.error("Failed to fetch the next quiz for student:", error);
        res.status(500).send("Internal server error");
    }
};

const activateQuiz = async (req, res) => {
    const { courseId, time } = req.body; // Extract courseId and time from request body

    try {
        const currentTime = new Date(time); // Convert time to Date object if it's not already

        // Find and update quizzes
        const result = await QuizModel.updateMany(
            {
                class: courseId,
                start_time: { $lte: currentTime },
                is_relesead: false,
            },
            {
                $set: { is_active: true, is_relesead: true },
            }
        );

        console.log(`Number of quizzes updated: ${result.modifiedCount}`);

        if (result.modifiedCount > 0) {
            const course = await ClassModel.findById({ _id: courseId });
            if (course) {
                console.log("Course", course);
                course.quizReleased =
                    course.quizReleased + result.modifiedCount;
                await course.save();
                console.log("Course Updated", course);
            }
            res.status(200).json({
                Message:
                    "Successfully activated ${result.modifiedCount} quizzes",
            });
        } else {
            res.send("No quizzes were updated. Please check your inputs.");
        }
    } catch (error) {
        res.status(500).send("An error occurred while updating the quizzes.");
        console.error(error);
    }
};

const deactivateQuiz = async (req, res) => {
    const { courseId, time } = req.body; // Extract courseId and time from request body

    try {
        const currentTime = new Date(time); // Convert time to Date object if it's not already

        // Find and update quizzes
        const result = await QuizModel.updateMany(
            {
                class: courseId,
                end_time: { $lte: currentTime },
            },
            {
                $set: { is_active: false },
            }
        );

        if (result.modifiedCount > 0) {
            res.status(200).json({
                Message:
                    "Successfully deactivated ${result.modifiedCount} quizzes",
            });
        } else {
            res.send("No quizzes were updated. Please check your inputs.");
        }
    } catch (error) {
        res.status(500).send("An error occurred while updating the quizzes.");
        console.error(error);
    }
};

const getNextQuizForTeacher = async (req, res) => {
    try {
        const teacher_id = req.decoded.id;

        // Find the classes taught by the teacher
        const classes = await ClassModel.find({ teacher: teacher_id });
        if (!classes.length) {
            return res
                .status(404)
                .send("Teacher not found teaching any classes");
        }

        // Extract class IDs for querying quizzes
        const classIds = classes.map((c) => c._id);

        const currentTime = new Date();

        // Find the next quiz for these classes
        const quiz = await QuizModel.find({
            class: { $in: classIds },
            is_active: false,
            is_relesead: false, // iski spelling ghalat hai
            start_time: { $gt: currentTime },
        })
            .sort({ start_time: 1 }) // Finds the closest future quiz
            .limit(1)
            .populate("class") // Adjust based on your need to populate related data
            .populate("questions"); // For populating related questions

        if (!quiz.length) {
            return res
                .status(404)
                .send("No next quiz found for the teacher's classes.");
        }

        res.status(200).json({
            message: "Next quiz found successfully",
            quiz: quiz[0],
        });
    } catch (error) {
        console.error("Failed to fetch the next quiz for teacher:", error);
        res.status(500).send("Internal server error");
    }
};

const getQuizQuestionsForStudent = async (req, res) => {
    try {
        const { quiz_id } = req.params;
        const quiz = await QuizModel.findById(quiz_id)
            .select("-submitted_by -is_active -is_relesead")
            .populate("questions", "-answer -true_grade -responses")
            .exec();
        if (!quiz) {
            return res.status(404).send("Quiz not found");
        }

        // Check if the student is enrolled in the class of the quiz
        const student_id = req.decoded.id;
        const classFound = await ClassModel.findById(quiz.class);
        if (!classFound.students.includes(student_id)) {
            return res.status(400).send("Student not enrolled in the class");
        }

        // Check if the quiz has ended or not started
        const currentTime = new Date();
        const updatedTime = new Date(
            currentTime.getTime() + 5 * 60 * 60 * 1000
        );
        if (quiz.start_time > updatedTime) {
            return res.status(400).send("Quiz has not started yet");
        }

        if (quiz.end_time < updatedTime) {
            return res.status(400).send("Quiz has ended");
        }

        res.status(200).json({
            message: "Quiz fetched successfully",
            quiz,
        });
    } catch (error) {
        console.error("Failed to fetch the quiz:", error);
        res.status(500).send("Internal server error");
    }
};

const submitQuiz = async (req, res) => {
    try {
        console.log("submit/:quiz_id");
        // student_res is array of question ids and their answers
        const quiz_id = req.params.quiz_id;
        let student_res = req.body.student_res;
        role = req.decoded.role;
        const student_id = req.decoded.id;

        if (!student_res) {
            return res.status(400).send("student_res are required");
        }

        // Find the quiz
        const quiz = await QuizModel.findById(quiz_id);
        if (!quiz) {
            return res.status(404).send("Quiz not found");
        }

        // Find the student
        const student = await StudentModel.findById(student_id);
        if (!student) {
            return res.status(404).send("Student not found");
        }

        // Check if the student is enrolled in the class of the quiz
        const classFound = await ClassModel.findById(quiz.class);
        if (!classFound.students.includes(student_id)) {
            return res.status(400).send("Student not enrolled in the class");
        }

        // Check if the quiz has ended or not started
        const currentTime = new Date();
        const updatedTime = new Date(
            currentTime.getTime() + 5 * 60 * 60 * 1000
        );

        if (quiz.start_time > updatedTime) {
            return res.status(400).send("Quiz has not started yet");
        }
        if (quiz.end_time < updatedTime) {
            return res.status(400).send("Quiz has ended");
        }

        // Check if the student has already submitted the quiz
        if (quiz.submitted_by.includes(student_id)) {
            return res
                .status(400)
                .send("Student has already submitted the quiz");
        }

        // For each question in array student_res add answer, question, grade from question model
        student_res = student_res.map(async (response) => {
            const quest = await QuestionModel.findById(response.question_id);
            if (!quest) {
                return res.status(404).send("Question not found");
            }
            return {
                question_id: response.question_id,
                student_answer: response.student_answer,
                question: quest.question,
                grade: quest.true_grade,
                answer: quest.answer,
            };
        });

        student_res = await Promise.all(student_res);

        console.log("Student Response", student_res);

        let grade;
        // Calculate the grade through flask API
        await axios
            .post("http://127.0.0.1:8000/grade", {
                quiz_id,
                student_id,
                student_res,
            })
            .then((response) => {
                grade = response.data;
            })
            .catch((error) => {
                console.error(
                    "Failed to grade the quiz, not stored in db:",
                    error
                );
                return res.status(500).send("Internal server error");
            });
        console.log("Grade", grade);

        total = 0;
        // Save the student response to each question in question model
        const submission = await Promise.all(
            grade.questions.map(async (response) => {
                const question = await QuestionModel.findById(
                    response.question_id
                );
                if (!question) {
                    return res.status(404).send("Question not found");
                }
                // Add int grade to total
                total += response.grade;
                question.responses.push({
                    student: student_id,
                    student_answer: response.student_answer,
                    grade: response.grade,
                });
                await question.save();
                return question;
            })
        );

        // Add student to submitted_by in quiz model
        quiz.submitted_by.push(student_id);
        await quiz.save();

        // Add to total grade of student in this quiz in student model
        student.quiz_grades.push({
            quiz: quiz_id,
            grade: total,
        });
        await student.save();

        res.status(200).json({
            message: "Quiz submitted successfully",
            submission,
        });
    } catch (error) {
        console.error("Failed to submit the quiz:", error);
        res.status(500).send("Internal server error");
    }
};

const getQuizResultsForTeacher = async (req, res) => {
    try {
        const { quiz_id } = req.params;
        const quiz = await QuizModel.findById(quiz_id);
        if (!quiz) {
            return res.status(404).send("Quiz not found");
        }

        // class highest and total number of submissions
        let class_highest = 0;
        let total_submissions = quiz.submitted_by.length;

        let results = await Promise.all(
            quiz.submitted_by.map(async (student_id) => {
                const student = await StudentModel.findById(student_id);
                if (!student) {
                    return res.status(404).send("Student not found");
                }
                return {
                    student_id: student_id,
                    student_name: student.name,
                    erp: student.erp,
                    grade: student.quiz_grades.find(
                        (grade) => grade.quiz == quiz_id
                    ).grade,
                };
            })
        );

        results.forEach((result) => {
            if (result.grade > class_highest) {
                class_highest = result.grade;
            }
        });

        res.status(200).json({
            message: "Quiz results found successfully",
            results,
            class_highest,
            total_submissions,
        });
    } catch (error) {
        console.error("Failed to fetch the quiz results for teacher:", error);
        res.status(500).send("Internal server error");
    }
};

const getQuizResultsForStudent = async (req, res) => {
    try {
        const { quiz_id } = req.params;
        const student_id = req.decoded.id;

        const quiz = await QuizModel.findById(quiz_id);
        if (!quiz) {
            return res.status(404).send("Quiz not found");
        }

        const student = await StudentModel.findById(student_id);
        if (!student) {
            return res.status(404).send("Student not found");
        }

        if (!quiz.submitted_by.includes(student_id)) {
            return res.status(400).send("Student has not submitted the quiz");
        }

        // for the quiz get all questions and student response to each and grade and total grade
        // true_grade and grade for overall quiz
        let total_grade = 0;
        let total_true_grade = 0;
        let results = await Promise.all(
            quiz.questions.map(async (question_id) => {
                const question = await QuestionModel.findById(question_id);
                if (!question) {
                    return res.status(404).send("Question not found");
                }
                const response = question.responses.find(
                    (response) => response.student == student_id
                );
                if (!response) {
                    return res.status(404).send("Response not found");
                }
                total_grade += response.grade;
                total_true_grade += question.true_grade;
                return {
                    question_id: question_id,
                    true_answer: question.answer,
                    true_grade: question.true_grade,
                    question: question.question,
                    student_answer: response.student_answer,
                    grade: response.grade,
                };
            })
        );

        res.status(200).json({
            message: "Quiz results found successfully",
            results,
            total_grade,
            total_true_grade,
        });
    } catch (error) {
        console.error("Failed to fetch the quiz results for student:", error);
        res.status(500).send("Internal server error");
    }
};

const updateQuiz = async (req, res) => {
    const { quizId } = req.params;
    const updateData = req.body;

    try {
        const updatedQuiz = await Quiz.findByIdAndUpdate(quizId, updateData, {
            new: true,
        });
        if (!updatedQuiz) {
            return res.status(404).send("Quiz not found");
        }
        res.status(200).json({
            message: "Quiz updated successfully",
            quiz: updatedQuiz,
        });
    } catch (error) {
        console.error("Error updating quiz:", error);
        res.status(500).send("Internal server error");
    }
};

const getQuizzesForTeacher = async (req, res) => {
    try {
        const teacherId = req.decoded.id;
        const classes = await ClassModel.find({ teacher: teacherId }).populate({
            path: 'quizzes',
            model: 'Quiz',
            select: '_id title questions start_time end_time is_active is_relesead class' // Specify fields to include
        });

        let quizzes = [];
        classes.forEach(cl => {
            // Map each quiz to the desired format
            const formattedQuizzes = cl.quizzes.map(quiz => ({
                id: quiz._id.toString(),
                title: quiz.title,
                questions: quiz.questions.map(q => q.toString()), // Assuming 'questions' is an array of String or ObjectIds
                start_time: quiz.start_time,
                end_time: quiz.end_time,
                is_active: quiz.is_active,
                is_relesead: quiz.is_relesead,
                class_id: quiz.class.toString()
            }));
            quizzes = quizzes.concat(formattedQuizzes);
            console.log('Quizzes:', quizzes);
        });

        res.status(200).json(quizzes); // send the formatted quizzes array
    } catch (error) {
        console.error('Error fetching quizzes by teacher:', error);
        res.status(500).send('Internal Server Error');
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
    getQuizQuestionsForStudent,
    submitQuiz,
    getQuizResultsForTeacher,
    getQuizResultsForStudent,
    updateQuiz,
    getQuizzesForTeacher,
};
