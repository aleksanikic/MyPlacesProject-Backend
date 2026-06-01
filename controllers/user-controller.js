const HttpError = require("../models/http-error.js");
const { validationResult } = require("express-validator");
const User = require("../models/user.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const getUsers = async (req, res, next) => {
    let users;
    try {
        users = await User.find({}, "-password");
    } catch (err) {
        const error = new HttpError(
            "Fetchin users failed, please try again later.",
            422,
        );
        return next(error);
    }
    res.json({ users: users.map((user) => user.toObject({ getters: true })) });
};

const signup = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(
            new HttpError("Invalid input passed, pleasecheck your data", 422),
        );
    }

    const { name, email, password } = req.body;
    let existingUser;
    try {
        existingUser = await User.findOne({ email: email });
    } catch (err) {
        const error = new HttpError(
            "Could not signup,please try again later.",
            500,
        );
        return next(error);
    }
    if (existingUser) {
        const error = new HttpError(
            "User already exists,please login instead.",
            422,
        );
        return next(error);
    }
    let hashedPassword;
    try {
        hashedPassword = await bcrypt.hash(password, 12);
    } catch (err) {
        const error = new HttpError(
            "Could not create user, please try again.",
            500,
        );
        return next(error);
    }

    const createdUser = new User({
        name,
        email,
        image: req.file.path,
        password: hashedPassword,
        places: [],
    });
    try {
        await createdUser.save();
    } catch (err) {
        const error = new HttpError("signing up failed, try again", 500);
        return next(error);
    }
    let token;
    try {
        token = jwt.sign(
            { userId: createdUser.id, email: createdUser.email },
            process.env.JWT_KEY,
            { expiresIn: "1h" },
        );
    } catch (err) {
        const error = new HttpError("signing up failed, try again", 500);
        return next(error);
    }

    res.status(201).json({
        userId: createdUser.id,
        email: createdUser.email,
        token: token,
    });
};



const login = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors);
        throw new HttpError("Invalid input passed, pleasecheck your data", 422);
    }
    const { email, password } = req.body;
    let existingUser;
    try {
        existingUser = await User.findOne({ email: email });
    } catch (err) {
        const error = new HttpError(
            "logged in failed ,please try again later.",
            500,
        );
        return next(error);
    }

    if (!existingUser) {
        return next(
            new HttpError(
                "Could not find user, credentilas seem to be wrong.",
                401,
            ),
        );
    }
    let isValidPassword = false;
    try {
        isValidPassword = await bcrypt.compare(password, existingUser.password);
    } catch (err) {
        const error = new HttpError(
            "Could not log you in, please check your credentials and try again.",
            500,
        );
        return next(error);
    }

    if (!isValidPassword) {
        return next(
            new HttpError(
                "Could not find user, credentilas seem to be wrong.",
                401,
            ),
        );
    }

    let token;
    try {
        token = jwt.sign(
            { userId: existingUser.id, email: existingUser.email },
            process.env.JWT_KEY,
            { expiresIn: "1h" },
        );
    } catch (err) {
        const error = new HttpError("Loggin in failed, try again", 500);
        return next(error);
    }

    res.json({
       userId:existingUser.id,
       email:existingUser.email,
       token:token
    });
};

exports.login = login;
exports.signup = signup;
exports.getUsers = getUsers;
