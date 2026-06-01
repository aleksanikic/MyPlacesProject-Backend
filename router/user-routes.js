const express = require("express");
const { check } = require("express-validator");

const router = express.Router();

const userController = require("../controllers/user-controller.js");
const fileUpload = require("../middleware/file-upload.js")

router.get("/", userController.getUsers);

router.post(
  "/signup",
  fileUpload.single("image"),
  [check('name').not().isEmpty(),check("email").normalizeEmail().isEmail(), check("password").isLength({ min: 6 })],
  userController.signup
);

router.post("/login",[check("email").normalizeEmail().isEmail(),check('password').isLength({min:6})] ,userController.login);

module.exports = router;
