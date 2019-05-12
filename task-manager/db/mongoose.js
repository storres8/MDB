const mongoose = require("mongoose");
const options = {
  useNewUrlParser: true,
  useCreateIndex: true
};
mongoose.connect("mongodb://127.0.0.1:27017/task-manager-api", options);

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
