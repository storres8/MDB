// Load in express so this file is connected to the framework
const express = require("express");
// initiate a new router variable with express.Router() so the application can load the routes
const router = new express.Router();
const User = require("../models/User");

// Post endpoint for Creating new Users
router.post("/users", async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    res.status(200).send(user);
  } catch (e) {
    res.status(400).send(e);
  }
});

// Get endpoint for getting all Users
router.get("/users", async (req, resp) => {
  try {
    const users = await User.find({});
    resp.send(users);
  } catch (error) {
    resp.status(500).send(error);
  }
});

// Get endpoint for fetching a specefic user based on their ID
router.get("/users/:id", async (req, resp) => {
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
router.patch("/users/:id", async (req, resp) => {
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

// Delete endpoint for Users
router.delete("/users/:id", async (req, resp) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return resp.status(404).send("No user found to delete");
    }
    resp.status(200).send(user);
  } catch (error) {
    resp.status(500).send(error);
  }
});

module.exports = router;
