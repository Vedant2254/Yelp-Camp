// If not production environment import dotenv module and run .config()
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
// Doing this will make the data in .env file available in this file

// process.env will have the values which can be accessed using keys
// Here we are accessing value of SECRET key
// console.log(process.env.SECRET);

const express = require("express");
const app = express();

const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const path = require("path");
const Campground = require("./models/campground");
const Review = require("./models/review");
const User = require("./models/user");
const catchAsync = require("./utils/catchAsync");
const ExpressError = require("./utils/ExpressError");
const schemas = require("./schemas");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const localStrategy = require("passport-local");
const mongoSanitize = require("express-mongo-sanitize");
const MongoStore = require("connect-mongo");

const userRoutes = require("./routes/users");
const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");

const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/yelp-camp";
mongoose.connect(dbUrl);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
  console.log("Database connected");
});
// mongoose connect section ends

// express app settings section starts
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
// express app settings section ends

// Middlewares starts
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(mongoSanitize());

// Creating session middleware
const secret = process.env.SECRET || "thisisnotgoodsecret";
const store = MongoStore.create({ mongoUrl: dbUrl });
store.on("error", function (e) {
  console.log("Session store error", e);
});
const sessionConfig = {
  store: MongoStore.create({
    mongoUrl: dbUrl,
  }),
  name: "session",
  secret,
  httpOnly: true,
  secure: true,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate())); // tells how to authenticate

passport.serializeUser(User.serializeUser()); // tells how to store users in session
passport.deserializeUser(User.deserializeUser()); // tells how to remove users from session

// Sets res.locals.* to flash messages values, res.locals is automatically passed to template
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

// Middlewares ends

// root route
app.get("/", (req, res) => {
  res.render("home");
});

app.get("/fakeUser", async (req, res) => {
  const user = new User({ username: "vedant", email: "vedant@gmail.com" }); // creating a user with values for our own defined fields in schema and a username field
  const newUser = await User.register(user, "chicken"); // registering a new user using User.register() method, it takes user object as input and a password which will be hashed
  res.send(newUser);
});

// route to users
// route to reviews
// route to campgrounds
app.use("/", userRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);

// any request to unknown route
app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

// Custom error handler
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Oh no, something went wrong!";
  res.status(statusCode).render("error", { err });
});

// listening to port 3000
const port = process.env.PORT || "3000";
app.listen(port, () => {
  console.log(`Serving on port ${port}`);
});
