const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Task = require("./Task");

// We create a seperate schema inorder to be able to use mongoose middleware
const userSchema = new mongoose.Schema(
  {
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
    },
    // Setting up a token field on the User document to store all the tokens generated for that specific user.
    // Token field will be an array of objects where each object is a different token that was generated when
    // the user logged in. That way the user can log in from multiple devices w/o an error being thrown.
    tokens: [
      {
        token: {
          type: String,
          required: true
        }
      }
    ],

    avatar: {
      // Buffer allows us to store the file upload as binary.
      type: Buffer
    }
  },
  {
    timestamps: true
  }
);

/* Setting up a virtual property on the User model. A virtual property is a relationship between to models,
and the information is not stored in the DB itself. Setting up this virtual property lets us establish a 
relationship to the Task model and query all the tasks that belong to a specific user with just their ID.
*/

userSchema.virtual("tasks", {
  // reference Task model
  ref: "Task",
  // local field must match the foreign field on the model we are referencing. So in Task it would be owner.
  localField: "_id",
  foreignField: "owner"
});

// Building the the findByCredentials method onto the User schema to verify login
/* statics allows us to define new function to be called onto our User model. In other words statucs allows us 
    to define Model methods what affect the model 
 */
userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email: email });

  if (!user) {
    // throw new error immediately end the execution of this function
    throw new Error("Login Failed");
  }
  // if there is no error than that means there is a user in the database that matches the email provided
  // in that case, we want to now verify that user's password
  /* bcrypt.compare returns a promise of true or false checking to see if the hashed password matched the
     plaun text text password once it has been hashed 
  */

  const isMatch = await bcrypt.compare(password, user.password);

  // If the user puts in the wrong password, but the right email we want to throw an error
  if (!isMatch) {
    throw new Error("Login Failed");
  }
  return user;
};

// MAKING SURE TO HASH THE PASSWORD
// setting up the mongoose middleware on the User model
// we're using .pre to tell the program that we want the middleware run before the user has been saved
/* 
we use the next argument in the CB to tell mongoose to continue running the file after the middleware is done
doing what we want. In this next() tells our function that we are done and want to proceed with saving the 
user
*/
userSchema.pre("save", async function(next) {
  const user = this;

  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

/* .methods allows us to define methods to be used on each instance of a new User. In other words the .methods
    action allows us to define specific methods on a new User instance not the entire model.
*/
userSchema.methods.generateAuthToken = async function() {
  const user = this;
  // creating a new JWT token
  const token = jwt.sign({ _id: user._id.toString() }, "verifyMyUser");
  // adding the new token into the array of object tokens defined in the user shema
  user.tokens = user.tokens.concat({ token: token });
  // saving the user
  await user.save();
  // returning the token
  return token;
};

// Method for removing the user password and tokens from the login response.
// .toJSON gets called whenever we stringify an object, and Express stringifys an object whenever we
// send a response back! So this method automaticlly gets called when we send a response.
/*user.toObject() is used for cloning the user object. userObject is the cloned object.
  Basically we are cloning the user object and removing certain properties from userObject object 
  and sending it as response.
  res.send(user) implicitly invokes JSON.stringify(user) which further implicitly invokes toJSON() 
  which returns userObject.
*/
userSchema.methods.toJSON = function() {
  const user = this;
  const userObject = user.toObject();
  delete userObject.password;
  delete userObject.tokens;
  return userObject;
};

// Cascade delete all tasks related to a user if that user is deleted.
// set up as middleware.
userSchema.pre("remove", async function(next) {
  const user = this;
  await Task.deleteMany({ owner: user._id });
  next();
});

// setting up the user model with the user schema defined above
const User = mongoose.model("User", userSchema);
module.exports = User;
