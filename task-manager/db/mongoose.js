const mongoose = require("mongoose");
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
  }
});

const me = new User({
  name: "steven torres",
  age: 23
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
    type: String
  },
  completed: {
    type: Boolean
  }
});

// const walkDog = new Task({
//   description: "Walk the dog after school",
//   completed: false
// });

// walkDog
//   .save()
//   .then(() => console.log(walkDog))
//   .catch(error => console.log(error));

const washDishes = new Task({
  description: "wash dishes before dinner",
  completed: true
});

washDishes
  .save()
  .then(() => console.log(washDishes))
  .catch(error => console.log(error));
