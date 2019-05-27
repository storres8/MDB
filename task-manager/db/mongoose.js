const mongoose = require("mongoose");
const options = {
  useNewUrlParser: true,
  useCreateIndex: true
};
mongoose.connect(process.env.MONGODB_URL, options);
