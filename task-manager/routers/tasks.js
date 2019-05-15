const Task = require("../models/Task");
const express = require("express");
const router = new express.Router();

// Post endpoint for creating new Tasks
router.post("/tasks", async (req, res) => {
  const task = await Task(req.body);

  try {
    await task.save();
    res.status(201).send(task);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Get endpoint for fetching all tasks in DB
router.get("/tasks", async (req, resp) => {
  try {
    const tasks = await Task.find({});
    resp.status(200).send(tasks);
  } catch (error) {
    resp.status(500).send(error);
  }
});

// Get endpoint for fetching a specific task with a task ID
router.get("/tasks/:id", async (req, resp) => {
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

router.patch("/tasks/:id", async (req, resp) => {
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

// Delete tasks from the DB
router.delete("/tasks/:id", async (req, resp) => {
  const task = await Task.findByIdAndDelete(req.params.id);
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
