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

// Patch endpoint for updating an existing user's information
app.patch("/users/:id", async (req, resp) => {
  // custom code to make sure only specified fields are updated if not throw error
  const allowedUpdates = ["name", "email", "password", "age"];
  const updates = Object.keys(req.body);
  const valid = updates.every(update => allowedUpdates.includes(update));

  if (!valid) {
    resp.status(400).send({ error: "Invalid updates." });
  }

  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    // Handles if there is no user found in the db
    if (!user) {
      return resp.status(404).send();
    }
    // if there was a user and data was valid return the updated user
    return resp.status(201).send(user);

    // catch will error out when there was a user but the data wasn't valid so no update
  } catch (error) {
    resp.status(400).send(error);
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

app.patch("/tasks/:id", async (req, resp) => {
  // custom code to make sure only specified fields are updated if not throw error
  const allowedUpdates = ["description", "completed"];
  const updates = Object.keys(req.body);
  const valid = updates.every(update => allowedUpdates.includes(update));

  if (!valid) {
    resp.status(400).send({ error: "Invalid updates." });
  }

  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    // Handles if there is no task found in the db
    if (!task) {
      return resp.status(404).send();
    }
    // if there was a task and data was valid return the updated task
    return resp.status(201).send(task);

    // catch will throw error when there was a task to create, but the data was invalid so no update of task
  } catch (error) {
    resp.status(400).send(error.message);
  }
});
