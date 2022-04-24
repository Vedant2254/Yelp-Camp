const express = require("express");
const router = express.Router({ mergeParams: true });
/* by default express keeps params seperate, means in app.js
the path is '/campgrounds/:id/reviews" so ":id" is not accessible
in this file "reviews.js". To make the parameters in prefix route accessible
we need to make "mergeParams" to true */

const Campground = require("./../models/campground");
const Review = require("./../models/review");
const catchAsync = require("./../utils/catchAsync");
const ExpressError = require("./../utils/ExpressError");
const schemas = require("./../schemas");
const { isLoggedIn, validateReview, isReviewAuthor } = require("../middleware");
const reviews = require("../controllers/reviews");

router.post("/", isLoggedIn, validateReview, catchAsync(reviews.createReview));

router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  catchAsync(reviews.deleteReview)
);

module.exports = router;
