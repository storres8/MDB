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
    required: true
  }
});

module.exports = Task;
