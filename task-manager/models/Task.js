const mongoose = require("mongoose");

const Task = mongoose.model("Task", {
  description: {
    type: String,
    required: true,
    trim: true,
    validate(value) {
      if (value.length < 10) {
        throw new Error(" description must be longer than 10 characters");
      }
    }
  },
  completed: {
    type: Boolean,
    default: false
  },
  owner: {
    // saying the data stored in owner is going to be an id.
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    /* Mongoose has a ref, short for reference, that allows us to link the Task model to the User model. The
      benefits of this is that if we query a single task we can also, with minimal code get all the info of 
      the specific user instance that wrote that specific task.
    */
    ref: "User"
  }
});

module.exports = Task;
