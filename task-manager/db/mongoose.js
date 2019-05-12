const mongoose = require("mongoose");
const options = {
  useNewUrlParser: true,
  useCreateIndex: true
};
mongoose.connect("mongodb://127.0.0.1:27017/task-manager-api", options);
