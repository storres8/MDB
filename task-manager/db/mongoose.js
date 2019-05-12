const mongoose = require("mongoose");
const validator = require("validator");
const options = {
  useNewUrlParser: true,
  useCreateIndex: true
};
mongoose.connect("mongodb://127.0.0.1:27017/task-manager-api", options);

// User model
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
    validate(value) {
      this.password = validator.trim(value);
      if (this.password.length < 6) {
        throw new Error("Password must be longer than 6 characters");
      } else if (this.password.includes("password")) {
        throw new Error("Password can not contain 'password'");
      }
    }
  }
});

const me = new User({
  name: "steven torres",
  age: 23,
  email: "steve2@gmail.com",
  password: "           4Everyoung          "
});

me.save()
  .then(() => {
    console.log(me);
  })
  .catch(errors => {
    console.log(errors);
  });

// Task model
const Task = mongoose.model("Task", {
  description: {
    type: String,
    required: true,
    validate(value) {
      this.description = validator.trim(this.description);
      if (value.length < 10) {
        throw new Error(" description must be longer than 10 characters");
      }
    }
  },
  completed: {
    type: Boolean,
    default: false
  }
});

let cleanRoom = new Task({
  description: "           clean room             "
});

cleanRoom
  .save()
  .then(() => {
    console.log(cleanRoom);
  })
  .catch(errors => {
    console.log(errors);
  });

// const washDishes = new Task({
//   description: "wash",
//   completed: true
// });

// washDishes
//   .save()
//   .then(() => console.log(washDishes))
//   .catch(error => console.log(error));
