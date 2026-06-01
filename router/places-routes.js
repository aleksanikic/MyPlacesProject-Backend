    const express = require("express");
    const { check } = require("express-validator");
    const fileUpload = require('../middleware/file-upload.js')
    const checkAuth = require('../middleware/check-auth.js')
    const router = express.Router();

    const placesController = require("../controllers/places-controller.js");

    router.get("/user/:uid", placesController.getPlacesByUserId);

    router.get("/:pid", placesController.getPlaceById);

    router.use(checkAuth);

    router.post(
        "/",
        fileUpload.single('image'),
        [
            check("title").not().isEmpty(),
            check("description").isLength({ min: 5 }),
            check("address").not().isEmpty(),
        ],
        placesController.createPlace
    );

    router.patch(
        "/:pid",
        [check("title").not().isEmpty(), check("description").isLength({ min: 5 })],
        placesController.updatePlace
    );

    router.delete("/:pid", placesController.deletePlace);

    module.exports = router;
