const cloudinary = require("cloudinary").v2;
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const placesRoutes = require("./router/places-routes.js");
const userRoutes = require("./router/user-routes.js");

const HttpError = require("./models/http-error.js");


const app = express();
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization",
    );
    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, DELETE, PATCH, OPTIONS",
    );

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    next();
});

app.use(bodyParser.json());

app.use("/api/places", placesRoutes);

app.use("/api/user", userRoutes);

app.use((req, res, next) => {
    const error = new HttpError("Could not find route.", 404);
    throw error;
});



app.use((error, req, res, next) => {
    if (req.file) {
        cloudinary.uploader.destroy(req.file.filename, (err, result) => {
            if (err) {
                console.log("Cloudinary deletion error:", err);
            } else {
                console.log("Cleaned up orphaned Cloudinary image.");
            }
        });
    }

    if (res.headersSent) {
        return next(error);
    }
    const statusCode = typeof error.code === "number" ? error.code : 500;
    res.status(statusCode);
    res.json({ message: error.message } || "An unknown error occurred");
});

mongoose
    .connect(
        `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.lvsin.mongodb.net/`,
    )
    .then(() => {
        app.listen(5000);
    })
    .catch((err) => {
        console.log(err);
    });
