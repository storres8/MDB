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
/* /tasks?completed=true <-- showing how we could filter through req.query.completed

  /tasks?limit=10&skip=0 <-- showing how we could paginate our results to not show all at once. Rather
  we would get the first 10 and then if the user wants anther 10 we could request it. Skip is the number
  of results that you would like to skip. For example if you skip 0 then its the first page of results, if 
  you skip 10 then you would be at the second page and if you skip 20 then you would be requesting the 3rd
  page of results.

  /tasks?sortBy=createdAt_asc
  tasks?sortBy=createdAt_desc 
*/
router.get("/tasks", auth, async (req, resp) => {
  // req.query.completed will contain the value from the url that will signify how the resp data
  // will be filtered and sent back.
  let match = {};
  let sort = {};

  if (req.query.completed === "true" || req.query.completed === "false") {
    match.completed = req.query.completed === "true";
  }

  if (req.query.sortBy) {
    const parts = req.query.sortBy.split("_");
    sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
  }

  try {
    // Using model.populate to pass in parameters that will filter the data we get back.
    // Populate lets you reference documents in other collections from a mongo DB,
    // and it will not run unless we invoke it with executePopulate()
    await req.user
      .populate({
        path: "tasks",
        //match is an object that will take in arguments to filter the data and bring back only the data
        // that fits the parameters defined in match.
        match: match,
        options: {
          limit: parseInt(req.query.limit),
          skip: parseInt(req.query.skip),
          sort: sort
        }
      })
      .execPopulate();
    resp.status(200).send(req.user.tasks);
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
