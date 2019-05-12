const express = require("express");
require("./db/mongoose");
const User = require("./models/User");

const app = express();

const port = process.env.PORT || 3000;

// Allows the express app to parse the body of our requests into JSON so we make use it
app.use(express.json());

app.post("/users", (req, res) => {
  const user = new User(req.body);
  user
    .save()
    .then(() => res.send(user))
    .catch(e => {
      res.status(400).send(e);
    });
});

app.listen(port, () => {
  console.log(`server is up and running on port ${port}`);
});
