const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middleware");
const Booking = require("../models/booking");
const Listing = require("../models/listing");
const User = require("../models/user");
const multer = require("multer");
// const upload = multer({ dest: "uploads/" });  for local not on cloud

const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../cloudConfugring");

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "ProfilePictures",
        allowed_formats: ["jpg", "jpeg", "png"]
    },
});

const upload = multer({ storage });


// GET /profile
router.get("/", isLoggedIn, async (req, res) => {
    const bookingsCount = await Booking.countDocuments({ user: req.user._id });
    const listingsCount = await Listing.countDocuments({ owner: req.user._id });
    
    res.render("profile", {
        user: req.user,
        bookingsCount,
        listingsCount
    });
});

// GET /profile/edit
router.get("/edit", isLoggedIn, (req, res) => {
    res.render("profileEdit", { user: req.user });
});

// POST /profile/edit
router.post("/edit", isLoggedIn, upload.single("profilePicture"), async (req, res) => {
    try {
        const { fullName, username, email, phone, country, city, address, bio, language, currency } = req.body;

        const updateData = {
            fullName,
            username,
            email,
            phone,
            country,
            city,
            address,
            bio,
            language,
            currency,
            emailNotifications: req.body.emailNotifications ? true : false,
            pushNotifications: req.body.pushNotifications ? true : false
        };

        if (req.file) {
            // updateData.profilePicture = `/uploads/${req.file.filename}`;
            updateData.profilePicture = req.file.path; // Cloudinary returns URL
        }

        const updatedUser = await User.findByIdAndUpdate(req.user._id, updateData, { new: true });

        req.login(updatedUser, err => {
            req.flash("success", "Profile updated!");
            return res.redirect("/profile");
        });

    } catch (err) {
        console.error("Profile Update Error:", err);
        req.flash("error", "Unable to update profile.");
        return res.redirect("/profile/edit");
    }
});


module.exports = router;
