const express = require("express");
const router = express.Router();
const Listing = require("../models/listing");
const Booking = require("../models/booking");
const { isLoggedIn } = require("../middleware");

/* =========================
   SHOW USER BOOKINGS
========================= */
router.get("/", isLoggedIn, async (req, res) => {
    const bookings = await Booking.find({ user: req.user._id })
        .populate("listing");

    res.render("Booking/index", { bookings });
});

/* =========================
   SHOW BOOKING FORM
========================= */
router.get("/new/:id", isLoggedIn, async (req, res) => {
    const { id } = req.params;

    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }

    res.render("Booking/NewBooking", { listing });
});

/* =========================
   CREATE BOOKING
========================= */
router.post("/", isLoggedIn, async (req, res) => {

    const {
        checkIn,
        checkOut,
        guests,
        listingId,
        fullName,
        email,
        phone,
        address,
        govtIdType,
        govtIdNumber
    } = req.body;

    const StartDate = new Date(checkIn);
    const EndDate = new Date(checkOut);

    /* --- VALIDATION 1: DATE ORDER --- */
    if (StartDate >= EndDate) {
        req.flash("error", "Check-out date must be after check-in date");
        return res.redirect(`/bookings/new/${listingId}`);
    }

    /* --- VALIDATION 2: PAST DATE --- */
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (StartDate < today) {
        req.flash("error", "Booking can't be done for past dates");
        return res.redirect(`/bookings/new/${listingId}`);
    }

    /* --- VALIDATION 3: LISTING EXISTS --- */
    const listing = await Listing.findById(listingId);
    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }

    /* --- VALIDATION 4: GUEST LIMIT --- */
    if (guests > listing.maxGuests) {
        req.flash("error", "Guest limit exceeded");
        return res.redirect(`/bookings/new/${listingId}`);
    }

    /* --- VALIDATION 5: DATE OVERLAP --- */
    const existingBookings = await Booking.find({
        listing: listingId,
        status: { $in: ["pending", "confirmed"] }
    });

    for (let booking of existingBookings) {
        if (
            StartDate < booking.checkOut &&
            EndDate > booking.checkIn
        ) {
            req.flash("error", "Selected dates are not available");
            return res.redirect(`/bookings/new/${listingId}`);
        }
    }

    /* --- VALIDATION 6: USER DETAILS --- */
    if (!fullName || !email || !phone || !address || !govtIdType || !govtIdNumber) {
        req.flash("error", "All guest details are required");
        return res.redirect(`/bookings/new/${listingId}`);
    }

    if (phone.length !== 10) {
        req.flash("error", "Invalid phone number");
        return res.redirect(`/bookings/new/${listingId}`);
    }

    /* --- CREATE BOOKING --- */
    const newBooking = new Booking({
        listing: listingId,
        user: req.user._id,
        fullName,
        email,
        phone,
        address,
        govtIdType,
        govtIdNumber,
        checkIn: StartDate,
        checkOut: EndDate,
        guests,
        status: "pending"
    });

    await newBooking.save();

    req.flash("success", "Booking request submitted successfully!");
    res.redirect("/bookings");
});

/* =========================
   CANCEL BOOKING
========================= */
router.post("/:id/cancel", isLoggedIn, async (req, res) => {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
        req.flash("error", "Booking not found");
        return res.redirect("/bookings");
    }

    if (!booking.user.equals(req.user._id)) {
        req.flash("error", "Unauthorized");
        return res.redirect("/bookings");
    }

    if (!["pending", "approved"].includes(booking.status)) {
        req.flash("error", "Booking cannot be cancelled");
        return res.redirect("/bookings");
    }

    booking.status = "cancelled";
    await booking.save();

    req.flash("success", "Booking cancelled successfully");
    res.redirect("/bookings");
});

/* =========================
   EDIT BOOKING
========================= */
router.get("/:id/edit", isLoggedIn, async (req, res) => {
    const booking = await Booking.findById(req.params.id).populate("listing");

    if (!booking) {
        req.flash("error", "Booking not found");
        return res.redirect("/bookings");
    }

    if (!booking.user.equals(req.user._id)) {
        req.flash("error", "Unauthorized");
        return res.redirect("/bookings");
    }

    if (booking.status === "cancelled") {
        req.flash("error", "Cancelled bookings cannot be edited");
        return res.redirect("/bookings");
    }

    res.render("Booking/edit", { booking });
});

/* =========================
   UPDATE BOOKING
========================= */
router.post("/:id/edit", isLoggedIn, async (req, res) => {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
        req.flash("error", "Booking not found");
        return res.redirect("/bookings");
    }

    if (!booking.user.equals(req.user._id)) {
        req.flash("error", "Unauthorized");
        return res.redirect("/bookings");
    }

    if (booking.status === "cancelled") {
        req.flash("error", "Cannot edit cancelled booking");
        return res.redirect("/bookings");
    }

    const {
        fullName,
        email,
        phone,
        address,
        govtIdType,
        govtIdNumber
    } = req.body;

    booking.fullName = fullName;
    booking.email = email;
    booking.phone = phone;
    booking.address = address;
    booking.govtIdType = govtIdType;
    booking.govtIdNumber = govtIdNumber;

    await booking.save();

    req.flash("success", "Booking information updated");
    res.redirect("/bookings");
});

module.exports = router;
