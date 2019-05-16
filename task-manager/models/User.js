const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

// We create a seperate schema inorder to be able to use mongoose middleware
const userSchema = new mongoose.Schema({
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

// setting up the mongoose middleware on the User model
// we're using .pre to tell the program that we want the middleware run before the user has been saved
/* 
we use the next argument in the CB to tell mongoose to continue running the file after the middleware is done
doing what we want. In this next tells our function that we are done and want to proceed with saving the user
*/

userSchema.pre("save", async function(next) {
  const user = this;

  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

// setting up the user model with the user schema defined above
const User = mongoose.model("User", userSchema);

module.exports = User;
