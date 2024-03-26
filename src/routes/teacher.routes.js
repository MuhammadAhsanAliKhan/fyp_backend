const express = require("express");
const teacherRoutes = express.Router();
const { body, param } = require("express-validator");
const teacherController = require("../controllers/teacher.controllers");
const { extractToken } = require("../middleware/middleware");
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

teacherRoutes
    .route("/signUp")
    .post(
        upload.single("profile_picture"),
        [body("email").isEmail(), body("password").isLength({ min: 5 })],
        teacherController.signUp
    );

teacherRoutes
    .route("/profile")
    .get(extractToken, teacherController.profile)
    .put(
        upload.single("profile_picture"),
        extractToken,
        [body("name").isString(), body("age").isNumeric()],
        teacherController.updateProfile
    );

module.exports = teacherRoutes;
