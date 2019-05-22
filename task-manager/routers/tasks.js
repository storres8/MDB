const Task = require("../models/Task");
const express = require("express");
const router = new express.Router();
const auth = require("../middleware/auth");

// Post endpoint for creating new Tasks
router.post("/tasks", auth, async (req, res) => {
  // const task = await Task(req.body);
  // setting up a new task with the ID of the user who created the task
  const task = new Task({
    ...req.body,
    owner: req.user._id
  });

  try {
    await task.save();
    res.status(201).send(task);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Get endpoint for fetching all tasks in DB
router.get("/tasks", auth, async (req, resp) => {
  try {
    const tasks = await Task.find({ owner: req.user._id });
    resp.status(200).send(tasks);
  } catch (error) {
    resp.status(500).send(error);
  }
});

// Get endpoint for fetching a specific task with a task ID
router.get("/tasks/:id", auth, async (req, resp) => {
  let _id = req.params.id;

  try {
    const task = await Task.findOne({ _id, owner: req.user._id });
    if (!task) {
      return resp.status(404).send();
    }
    resp.status(200).send(task);
  } catch (error) {
    resp.status(500).send(error);
  }
});

router.patch("/tasks/:id", auth, async (req, resp) => {
  // custom code to make sure only specified fields are updated if not throw error
  const allowedUpdates = ["description", "completed"];
  const updates = Object.keys(req.body);
  const valid = updates.every(update => allowedUpdates.includes(update));

  if (!valid) {
    resp.status(400).send({ error: "Invalid updates." });
  }

  try {
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id
    });
    // Handles if there is no task found in the db
    if (!task) {
      return resp.status(404).send();
    }

    // updated logic for applying the .save() method which allows us to use middleware with mongoose:
    updates.forEach(update => {
      task[update] = req.body[update];
    });
    task.save();

    // if there was a task and data was valid return the updated task
    return resp.status(201).send(task);

    // catch will throw error when there was a task to create, but the data was invalid so no update of task
  } catch (error) {
    resp.status(400).send(error.message);
  }
});

// Delete tasks from the DB
router.delete("/tasks/:id", auth, async (req, resp) => {
  const task = await Task.findOneAndDelete({
    _id: req.params.id,
    owner: req.user._id
  });
  try {
    if (!task) {
      return resp.status(404).send("no task found to delete");
    }
    resp.status(200).send(task);
  } catch (error) {
    resp.status(500).send(error);
  }
});

module.exports = router;
