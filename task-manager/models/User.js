const mongoose = require("mongoose");
const validator = require("validator");

const User = mongoose.model("User", {
  name: {
    type: String
  },
  age: {
    type: Number
  },
  email: {
    type: String,
    unique: true,
    required: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("Invalid Email");
      }
    }
  },
  password: {
    type: String,
    required: true,
    trim: true,
    validate(value) {
      if (value < 6) {
        throw new Error("Password must be longer than 6 characters");
      } else if (value.toLowerCase().includes("password")) {
        throw new Error("Password can not contain 'password'");
      }
    }
  }
});

module.exports = User;
