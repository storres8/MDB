const express = require("express");
require("./db/mongoose");
const User = require("./models/User");
const Task = require("./models/Task");
const app = express();

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`server is up and running on port ${port}`);
});

// Allows the express app to parse the body of our requests into JSON so we make use it
app.use(express.json());

// Post endpoint for Creating new Users
app.post("/users", (req, res) => {
  const user = new User(req.body);
  user
    .save()
    .then(() => res.send(user))
    .catch(e => {
      res.status(400).send(e);
    });
});

// Get endpoint for getting all Users
app.get("/users", (req, resp) => {
  User.find({})
    .then(users => resp.send(users))
    .catch(e => resp.status(500).send(e));
});

// Get endpoint for fetching a specefic user based on their ID
app.get("/users/:id", (req, resp) => {
  let id = req.params.id;
  User.findById(id)
    .then(user => {
      if (!user) {
        return resp.status(404).send("User not found");
      }
      resp.status(200).send(user);
    })
    .catch(() => {
      resp.status(500).send("User not found");
    });
});

// Post endpoint for creating new Tasks
app.post("/tasks", (req, res) => {
  const task = new Task(req.body);
  task
    .save()
    .then(() => {
      res.send(task);
    })
    .catch(e => {
      res.status(400).send(e);
    });
});

// Get endpoint for fetching all tasks in DB
app.get("/tasks", (req, resp) => {
  Task.find({}).then(tasks => {
    resp
      .status(200)
      .send(tasks)
      .catch(e => {
        resp.status(500).send(e);
      });
  });
});

// Get endpoint for fetching a specific task with a task ID
app.get("/tasks/:id", (req, resp) => {
  let id = req.params.id;
  Task.findById(id)
    .then(task => {
      if (!task) {
        resp.status(404).send("Task does not exist");
      }
      resp.status(200).send(task);
    })
    .catch(e => {
      resp.status(500).send(e);
    });
});
