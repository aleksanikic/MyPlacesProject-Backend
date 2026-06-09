    const { validationResult } = require("express-validator");
    const mongoose = require("mongoose");
    const cloudinary = require("cloudinary").v2;

    const getCoordsForAdrress = require("../util/location.js");
    const Place = require("../models/place.js");
    const User = require("../models/user.js");

    const HttpError = require("../models/http-error.js");

    const getPlaceById = async (req, res, next) => {
        const userId = req.params.pid;
        let place;
        try {
            place = await Place.findById(userId);
        } catch (err) {
            const error = new HttpError(
                "Something went wrong, could not find place.",
                500,
            );
            return next(error);
        }

        if (!place) {
            const error = new HttpError(
                "Could not find a place for the provided id",
                404,
            );
            return next(error);
        }

        res.json({ place: place.toObject({ getters: true }) });
    };

    const getPlacesByUserId = async (req, res, next) => {
        const userId = req.params.uid;
        // let places;
        let userWithPlaces;
        try {
            userWithPlaces = await User.findById(userId).populate("places");
        } catch (err) {
            const error = new HttpError(
                "Fetching a places failed, please try again later.",
                500,
            );
            return next(error);
        }
        if (!userWithPlaces || userWithPlaces.places.length === 0) {
            return next(
                new HttpError(
                    "Could not find a places for the provided user id",
                    404,
                ),
            );
        }
        res.json({
            places: userWithPlaces.places.map((place) =>
                place.toObject({ getters: true }),
            ),
        });
    };

    const createPlace = async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log(errors);
            return next(
                new HttpError("Invalid input passed, pleasecheck your data", 422),
            );
        }

        const { title, description, address } = req.body;

        let coordinates;
        try {
            coordinates = await getCoordsForAdrress(address);
        } catch (error) {
            return next(error);
        }

        const createdPlace = new Place({
            title,
            description,
            image: req.file.path,
            address,
            location: coordinates,
            creator: req.userData.userId,
        });

        let user;
        try {
            user = await User.findById(req.userData.userId);
        } catch (err) {
            const error = new HttpError(
                "creating place fail please try again.",
                500,
            );
            return next(error);
        }
        if (!user) {
            const error = new HttpError("Could not find user for provided id", 404);
            return next(error);
        }

        try {
            const sess = await mongoose.startSession();
            sess.startTransaction();
            await createdPlace.save({ session: sess });
            user.places.push(createdPlace);
            await user.save({ session: sess });
            await sess.commitTransaction();
        } catch (err) {
            const error = new HttpError(
                "creating place fail please try again",
                500,
            );
            return next(error);
        }

        res.status(201).json({ place: createdPlace });
    };

    const updatePlace = async (req, res, next) => {
        const errors = validationResult(req);
        const { title, description } = req.body;
        if (!errors.isEmpty()) {
            console.log(errors);
            return next(
                new HttpError("Invalid input passed, pleasecheck your data", 422),
            );
        }
        const userId = req.params.pid;
        let place;
        try {
            place = await Place.findById(userId);
        } catch (err) {
            const error = new HttpError(
                "Something went wrong, could not update place.",
                500,
            );
            return next(error);
        }

        if (place.creator.toString() !== req.userData.userId) {
            const error = new HttpError(
                "You are not authorized to edit this place.",
                401,
            );
            return next(error);
        }

        place.title = title;
        place.description = description;

        try {
            await place.save();
        } catch (err) {
            const error = new HttpError(
                "Something went wrong, could not update place.",
                500,
            );
            return next(error);
        }

        res.status(200).json({ place: place.toObject({ getters: true }) });
    };

    const deletePlace = async (req, res, next) => {
        const userId = req.params.pid;
        let place;
        try {
            place = await Place.findById(userId).populate("creator");
        } catch (err) {
            const error = new HttpError(
                "Something went wrong, could not delete place.",
                500,
            );
            return next(error);
        }
        if (!place) {
            const error = new HttpError("Could not find place for this id.", 404);
            return next(error);
        }

        if (place.creator.id !== req.userData.userId) {
            const error = new HttpError(
                "You are not authorized to delete this place.",
                401,
            );
            return next(error);
        }
        const extractPublicId = (url) => {
            const splitUrl = url.split("/");
            const folder = splitUrl[splitUrl.length - 2];
            const fileWithExtension = splitUrl[splitUrl.length - 1];
            const file = fileWithExtension.split(".")[0];
            return `${folder}/${file}`;
        };
        const cloudImageId = extractPublicId(place.image);
        try {
            const sess = await mongoose.startSession();
            sess.startTransaction();
            await place.deleteOne({ session: sess });
            place.creator.places.pull(place);
            await place.creator.save({ session: sess });
            await sess.commitTransaction();
        } catch (err) {
            const error = new HttpError(
                "Something went wrong, could not delete place.",
                500,
            );
            return next(error);
        }
        cloudinary.uploader.destroy(cloudImageId, (err) => console.log(err));
        res.status(200).json({ message: "Deleted place" });
    };

    exports.updatePlace = updatePlace;
    exports.createPlace = createPlace;
    exports.getPlaceById = getPlaceById;
    exports.getPlacesByUserId = getPlacesByUserId;
    exports.deletePlace = deletePlace;
