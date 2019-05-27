const express = require("express");
require("./db/mongoose");
const app = express();
const userRouter = require("./routers/users");
const taskRouter = require("./routers/tasks");

const port = process.env.PORT;

// Allows the express app to parse the body of our requests into JSON so we make use it
app.use(express.json());
//telling the app to use the router we created in the users file
app.use(userRouter);
// telling appp to use Task router
app.use(taskRouter);

app.listen(port, () => {
  console.log(`server is up and running on port ${port}`);
});
