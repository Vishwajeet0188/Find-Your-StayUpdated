const express = require("express");
const router = express.Router();
const WrapAsync = require("../utils/WrapAsync.js");
const { listingSchema } = require("../Schema.js");
const ExpressError = require("../utils/ExpressError.js");
const { isLoggedIn, isOwner, isLister } = require("../middleware.js");
const ListingController = require("../Controllers/listing.js");
const Listing = require("../models/listing.js");

const multer = require("multer");
const { storage } = require("../cloudConfugring.js");
const upload = multer({ storage });

// VALIDATE LISTING
const validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    let msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  }
  next();
};

/*  INDEX ROUTE  */
router.get("/", WrapAsync(ListingController.index));

// host

router.get("/host", (req, res) => {
  if (!req.isAuthenticated()) {
    req.flash("error", "Please login to host properties.");
    return res.redirect("/login");
  }

  const user = req.user;

  if (user.role === "lister") return res.redirect("/listings/manage");
  if (user.role === "admin") return res.redirect("/admin/dashboard");

  req.flash("error", "You don't have permission to host. Sign up as a Property Lister.");
  return res.redirect("/signup");
});



// Manage Route : 
router.get("/manage", isLoggedIn, isLister, async (req, res) => {
  const listings = await Listing.find({ owner: req.user._id });
  res.render("listings/manage.ejs", { listings });
});



/* NEW LISTING FORM */
router.get("/new", isLoggedIn, isLister,ListingController.renderNewForm);

/*  CREATE LISTING  */
router.post(
  "/",
  isLoggedIn,
  isLister,
  upload.single("listing[image]"),
  validateListing,
  WrapAsync(ListingController.CreateListing)
);

/*  CATEGORY ROUTE MUST be here BEFORE /:id  */
router.get("/category/:category", WrapAsync(ListingController.filterByCategory));

/*  EDIT FORM  */
router.get("/:id/edit", isLoggedIn, isOwner, WrapAsync(ListingController.EditForm));

/*  UPDATE LISTING  */
router.put(
  "/:id",
  isLoggedIn,
  isOwner,
  upload.single("listing[image]"),
  validateListing,
  WrapAsync(ListingController.RenderUpdateForm)
);

/*  WISHLIST TOGGLE  */
router.post("/:id/wishlist", isLoggedIn, async (req, res) => {
  const listingId = req.params.id;
  const user = req.user;

  if (user.wishlist.includes(listingId)) {
    user.wishlist.pull(listingId);
  } else {
    user.wishlist.push(listingId);
  }

  await user.save();
  req.flash("success", "Wishlist updated!");
  res.redirect("/listings");
});

/*  SHOW LISTING  */
router.get("/:id", WrapAsync(ListingController.ShowListing));

/*  DELETE LISTING  */
router.delete("/:id", isLoggedIn, isOwner, WrapAsync(ListingController.DeleteListing));



module.exports = router;
