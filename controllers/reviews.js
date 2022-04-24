const Campground = require("../models/campground");
const Review = require("../models/review");

module.exports.createReview = async (req, res) => {
  const review = new Review(req.body.review);
  review.author = req.user._id;
  const campground = await Campground.findById(req.params.id);
  campground.reviews.push(review);
  await review.save();
  await campground.save();
  req.flash("success", "Added your review");
  res.redirect(`/campgrounds/${req.params.id}`);
};

module.exports.deleteReview = async (req, res) => {
  const { id, reviewId } = req.params;
  await Campground.findByIdAndUpdate(id, {
    $pull: { reviews: reviewId },
  });
  await Review.findByIdAndDelete(reviewId);
  req.flash("success", "Deleted your review");
  res.redirect(`/campgrounds/${id}`);
};
