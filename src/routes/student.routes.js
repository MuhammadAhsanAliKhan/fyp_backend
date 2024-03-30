const express = require("express");
const studentRoutes = express.Router();
const { body, param } = require("express-validator");
const studentController = require("../controllers/student.controllers");
const { extractToken, checkRole } = require("../middleware/middleware");
const multer = require("multer");
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    },
});
const upload = multer({ storage: storage });

studentRoutes
    .route("/signUp")
    .post(
        upload.single("profile_picture"),
        [body("email").isEmail(), body("password").isLength({ min: 5 })],
        studentController.signUp
    );

studentRoutes
    .route("/profile")
    .get(extractToken, studentController.profile)
    .put(
        upload.single("profile_picture"),
        extractToken,
        [
            body("name").isString().optional(),
            body("age").isNumeric().optional(),
            body("erp").isNumeric().optional(),
        ],
        studentController.updateProfile
    );

studentRoutes
    .route("/joinClass")
    .post(
        extractToken,
        checkRole("student"),
        [body("class_code").isString()],
        studentController.joinClass
    );

studentRoutes
    .route("/leaveClass/:classId")
    .post(
        extractToken,
        checkRole("student"),
        [param("classId").isMongoId()],
        studentController.leaveClass
    );

// studentRoutes.route("uploads/:filename").get(studentController.getPicture);

module.exports = studentRoutes;
