const User = require("../models/user");

module.exports.renderRegisterForm = (req, res) => {
  res.render("users/register");
};

module.exports.registerUser = async (req, res, next) => {
  try {
    const { username, password, email } = req.body;
    const user = new User({ email, username });
    const registeredUser = await User.register(user, password);
    req.login(registeredUser, (err, next) => {
      if (err) return next(err);
      req.flash("success", "Registered Successfully");
      res.redirect("/campgrounds");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/register");
  }
};

module.exports.renderLoginForm = (req, res) => {
  res.render("users/login");
};

module.exports.loginUser = (req, res) => {
  req.flash("success", "Welcome back");
  const returnTo = req.session.returnTo || "/campgrounds";
  delete req.session.returnTo;
  res.redirect(returnTo);
};

module.exports.logout = (req, res) => {
  req.logout();
  req.flash("success", "GoodBye!");
  res.redirect("/campgrounds");
};
