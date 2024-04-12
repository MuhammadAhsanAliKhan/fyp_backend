const Class = require("../models/class.model");
// const ClassStudent = require("../models/classStudent.model");
const Quiz = require("../models/quiz.model");
const Review = require("../models/review.model");
const Teacher = require("../models/teacher.model");
const { validationResult } = require("express-validator");
const Student = require("../models/student.model");

const createClass = async (req, res) => {
    try {
        console.log("/class");

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        role = req.decoded.role;
        id = req.decoded.id;

        if (role !== "teacher") {
            return res.status(403).json({ msg: "Forbidden" });
        }

        const teacher = id;

        const { name, description } = req.body;

        // 4 digit random number
        const join_code = Math.floor(1000 + Math.random() * 9000);

        const class_ = new Class({
            course_name: name,
            teacher,
            description,
            join_code,
            quizCreated: 0,
            quizReleased: 0,
            studentEnrolledCount: 0,
        });

        await class_.save();

        // add class to teacher classes
        const teacher_ = await Teacher.findById(teacher);
        teacher_.classes.push(class_._id);
        await teacher_.save();

        res.status(201).json({ msg: "Class created successfully" });
    } catch (error) {
        console.log("err:", error);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};

const getClasses = async (req, res) => {
    try {
        console.log("/class");

        role = req.decoded.role;
        id = req.decoded.id;

        let classes;
        if (role === "teacher") {
            classes = await Class.find({ teacher: id });
        } else {
            // find all classes where the student is enrolled
            const students = await Student.findById(id);
            classes = students.classes;
            classes = await Class.find({ _id: { $in: classes } });
        }
        console.log(classes);

        // instead of avg_rating from db, we will calculate avg rating

        classes = classes.map(async (class_) => {
            let totalRating = 0; // Start with the rating of the new review

            const reviews = await Review.find({ class: class_._id });

            console.log("reviews:", reviews);

            if (reviews.length > 0) {
                totalRating += reviews.reduce((acc, review) => {
                    return acc + review.rating;
                }, 0);
            }

            console.log("totalRating:", totalRating);

            class_.avg_rating = totalRating / class_.review_count;

            console.log("class_.avg_rating:", class_.avg_rating);
            console.log("class_:", class_);

            return class_;
        });
        classes = await Promise.all(classes);

        res.status(200).json(classes);
    } catch (error) {
        console.log("err:", error);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};

const getClass = async (req, res) => {
    try {
        console.log("/class/:id");

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        let class_ = await Class.findById(req.params.id)
            .populate("teacher", "name email profile_picture")
            .populate("students", "name email erp profile_picture")
            .populate("quizzes", "title");

        if (!class_) {
            return res.status(404).json({ msg: "Class not found" });
        }

        // instead of avg_rating from db, we will calculate avg rating

        let totalRating = 0; // Start with the rating of the new review

        const reviews = await Review.find({ class: class_._id });

        console.log("reviews:", reviews);

        if (reviews.length > 0) {
            totalRating += reviews.reduce((acc, review) => {
                return acc + review.rating;
            }, 0);
        }

        console.log("totalRating:", totalRating);

        class_.avg_rating = totalRating / class_.review_count;

        console.log("class_.avg_rating", class_.avg_rating);

        res.status(200).json(class_);
    } catch (error) {
        console.log("err:", error);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};

// delete class
const deleteClass = async (req, res) => {
    try {
        console.log("/class/:id");

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        role = req.decoded.role;
        id = req.decoded.id;

        if (role !== "teacher") {
            return res.status(403).json({ msg: "Forbidden" });
        }

        const class_ = await Class.findById(req.params.id);

        if (!class_) {
            return res.status(404).json({ msg: "Class not found" });
        }

        // remove class from teacher classes
        const teacher = await Teacher.findById(class_.teacher);
        teacher.classes = teacher.classes.filter(
            (classId) => classId.toString() !== req.params.id
        );
        await teacher.save();

        // remove class from all students classes
        const students = await Student.find({ classes: req.params.id });
        for (let i = 0; i < students.length; i++) {
            students[i].classes = students[i].classes.filter(
                (classId) => classId.toString() !== req.params.id
            );
            await students[i].save();
        }

        // remove all quizzes of the class
        await Quiz.deleteMany({ class: req.params.id });

        // remove all reviews of the class
        await Review.deleteMany({ class: req.params.id });

        await Class.findByIdAndDelete(req.params.id);

        res.status(200).json({ msg: "Class deleted successfully" });
    } catch (error) {
        console.log("err:", error);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};

const getClassStudents = async (req, res) => {
    try {
        console.log("/class/:id/students");

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const class_ = await Class.findById(req.params.id).populate(
            "students",
            "name email classes profile_picture erp"
        );

        console.log("class:", class_);

        if (!class_) {
            return res.status(404).json({ msg: "Class not found" });
        }

        const students = class_.students.map((student) => student);
        console.log("students:", students);

        studentEnrolledCount = class_.studentEnrolledCount;

        res.status(200).json({ studentEnrolledCount, students });
    } catch (error) {
        console.log("err:", error);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};

// remove student from a class
const removeStudent = async (req, res) => {
    try {
        console.log("/class/:id/students/:studentId");

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        role = req.decoded.role;
        id = req.decoded.id;

        if (role !== "teacher") {
            return res.status(403).json({ msg: "Forbidden" });
        }

        const class_ = await Class.findById(req.params.id);

        if (!class_) {
            return res.status(404).json({ msg: "Class not found" });
        }

        const student = await Student.findById(req.params.studentId);

        if (!student) {
            return res.status(404).json({ msg: "Student not found" });
        }

        if (!student.classes.includes(req.params.id)) {
            return res
                .status(400)
                .json({ msg: "Student not enrolled in class" });
        }

        if (!class_.students.includes(req.params.studentId)) {
            return res.status(400).json({ msg: "Student not in class" });
        }

        if (class_.teacher.toString() !== id) {
            return res.status(403).json({ msg: "Forbidden incorrect teacher" });
        }

        // remove class from student classes
        student.classes = student.classes.filter(
            (classId) => classId.toString() !== req.params.id
        );
        await student.save();

        // remove student from class students
        class_.students = class_.students.filter(
            (studentId) => studentId.toString() !== req.params.studentId
        );

        // update studentEnrolledCount in class
        class_.studentEnrolledCount -= 1;

        await class_.save();

        res.status(200).json({ msg: "Student removed from class" });
    } catch (error) {
        console.log("err:", error);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};

const getClassQuizzes = async (req, res) => {
    try {
        console.log("/class/:id/quiz");

        const class_ = await Class.findById(req.params.id).populate(
            "quizzes",
            "name"
        );

        if (!class_) {
            return res.status(404).json({ msg: "Class not found" });
        }

        res.status(200).json(class_.quizzes);
    } catch (error) {
        console.log("err:", error);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};

const leaveReview = async (req, res) => {
    try {
        console.log("/class/:id/reviews");

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        role = req.decoded.role;
        id = req.decoded.id;

        if (role !== "student") {
            return res.status(403).json({ msg: "Forbidden" });
        }

        const class_ = await Class.findById(req.params.id);

        if (!class_) {
            return res.status(404).json({ msg: "Class not found" });
        }

        const student = await Student.findById(id);

        if (!student.classes.includes(req.params.id)) {
            return res
                .status(400)
                .json({ msg: "Student not enrolled in class" });
        }

        const existingReview = await Review.findOne({
            class: req.params.id,
            student: id,
        });
        if (existingReview) {
            return res.status(409).json({ msg: "Class already reviewed" });
        }

        const { rating, description } = req.body;

        const review_ = new Review({
            class: req.params.id,
            student: id,
            rating,
            description,
        });

        await review_.save();

        // add review to class reviews
        class_.reviews.push(review_._id);
        class_.review_count += 1;

        // DONT use avg_rating in class_ to calculate avg rating

        // let totalRating = rating; // Start with the rating of the new review

        // if (class_.reviews.length > 0) {
        //     totalRating += class_.reviews.reduce((acc, reviewId) => {
        //         return acc + reviewId.rating;
        //     }, 0);
        // }

        // class_.avg_rating = totalRating / class_.review_count;

        await class_.save();

        res.status(201).json({ msg: "Review created successfully" });
    } catch (error) {
        console.log("err:", error);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};

const getReviews = async (req, res) => {
    try {
        console.log("/class/:id/reviews");

        const class_ = await Class.findById(req.params.id).populate(
            "reviews",
            "rating description"
        );

        if (!class_) {
            return res.status(404).json({ msg: "Class not found" });
        }

        const reviewsAggregate = await Review.aggregate([
            {
                $match: { class: class_._id },
            },
            {
                $group: {
                    _id: "$rating",
                    count: { $sum: 1 },
                },
            },
            {
                $sort: { _id: -1 },
            },
        ]);

        // Prepare summary data
        const summary = {
            ratingSummary: {},
        };

        // Convert aggregate result to summary object
        let totalRating = 0;
        reviewsAggregate.forEach((rating) => {
            totalRating += rating._id * rating.count;
            summary.ratingSummary[rating._id] = rating.count;
        });

        // Include class's average rating and review count
        const classInfo = {
            avgRating: totalRating / class_.review_count,
            reviewCount: class_.review_count,
        };

        res.status(200).json({ reviews: class_.reviews, summary, classInfo });
    } catch (error) {
        console.log("err:", error);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};

const deleteReview = async (req, res) => {
    try {
        console.log("/class/:id/reviews/:reviewId");

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        role = req.decoded.role;
        id = req.decoded.id;

        if (role !== "student") {
            return res.status(403).json({ msg: "Forbidden" });
        }

        const class_ = await Class.findById(req.params.id);

        if (!class_) {
            return res.status(404).json({ msg: "Class not found" });
        }

        const student = await Student.findById(id);

        if (!student.classes.includes(req.params.id)) {
            return res
                .status(400)
                .json({ msg: "Student not enrolled in class" });
        }

        const review_ = await Review.findById(req.params.reviewId);

        if (!review_) {
            return res.status(404).json({ msg: "Review not found" });
        }

        if (review_.student.toString() !== id) {
            return res.status(403).json({ msg: "Forbidden incorrect student" });
        }

        // remove review from class reviews
        class_.reviews = class_.reviews.filter(
            (reviewId) => reviewId.toString() !== req.params.reviewId
        );

        // update avg_rating in class
        // class_.avg_rating =
        //     (class_.avg_rating * class_.review_count - review_.rating) /
        //     (class_.review_count - 1);

        class_.review_count -= 1;

        await class_.save();

        // delete review
        await Review.findByIdAndDelete(req.params.reviewId);

        res.status(200).json({ msg: "Review deleted successfully" });
    } catch (error) {
        console.log("err:", error);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};

module.exports = {
    createClass,
    getClasses,
    getClass,
    deleteClass,
    getClassStudents,
    removeStudent,
    getClassQuizzes,
    leaveReview,
    getReviews,
    deleteReview,
};
