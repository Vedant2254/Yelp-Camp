const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
});

// This gives us fields for username, password and some methods
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
