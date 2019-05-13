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
app.post("/users", async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    res.status(200).send(user);
  } catch (e) {
    res.status(400).send(e);
  }
});

// Get endpoint for getting all Users
app.get("/users", async (req, resp) => {
  try {
    const users = await User.find({});
    resp.send(users);
  } catch (error) {
    resp.status(500).send(error);
  }
});

// Get endpoint for fetching a specefic user based on their ID
app.get("/users/:id", async (req, resp) => {
  let id = req.params.id;
  try {
    let user = await User.findById(id);
    if (!user) {
      return resp.status(404).send("User not found");
    }
    resp.status(200).send(user);
  } catch (error) {
    resp.status(500).send(error);
  }
});

// Post endpoint for creating new Tasks
app.post("/tasks", async (req, res) => {
  const task = await Task(req.body);

  try {
    await task.save();
    res.status(201).send(task);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Get endpoint for fetching all tasks in DB
app.get("/tasks", async (req, resp) => {
  try {
    const tasks = await Task.find({});
    resp.status(200).send(tasks);
  } catch (error) {
    resp.status(500).send(error);
  }
});

// Get endpoint for fetching a specific task with a task ID
app.get("/tasks/:id", async (req, resp) => {
  let id = req.params.id;

  try {
    let task = await Task.findById(id);
    if (!task) {
      return resp.status(404).send("Task not found");
    }
    resp.status(200).send(task);
  } catch (error) {
    resp.status(500).send(error);
  }
});
