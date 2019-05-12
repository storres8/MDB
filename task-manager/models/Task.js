const mongoose = require("mongoose");
const validator = require("validator");

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

module.exports = Task;
