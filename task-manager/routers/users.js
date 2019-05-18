// Load in express so this file is connected to the framework
const express = require("express");
// initiate a new router variable with express.Router() so the application can load the routes
const router = new express.Router();
const User = require("../models/User");
const auth = require("../middleware/auth");

// Login in router for a user
router.post("/users/login", async (req, resp) => {
  const email = req.body.email;
  const password = req.body.password;
  try {
    // findByCredentials is a custom method we built on the user model to handle verification of the user
    const user = await User.findByCredentials(email, password);
    const token = await user.generateAuthToken();
    resp.status(200).send({
      user: user,
      token: token
    });
  } catch (error) {
    resp.status(400).send(error);
  }
});

router.post("/users/logout", auth, async (req, resp) => {
  try {
    let currentToken = req.token;
    req.user.tokens = req.user.tokens.filter(token => {
      return token.token !== currentToken;
    });
    await req.user.save();
    resp.status(200).send("Logged Out");
  } catch (error) {
    resp.status(500).send({ error: "loggout failed" });
  }
});

// Post endpoint for Creating new Users
router.post("/users", async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    const token = await user.generateAuthToken();
    res.status(201).send({
      user: user,
      token: token
    });
  } catch (e) {
    res.status(400).send(e);
  }
});

// Get for a user to get their profile when they are authenticated.
// setting in the middlware function as the second argument in the router allows us to use the middleware
// only for this specific route and no other.
router.get("/users/me", auth, async (req, resp) => {
  resp.status(200).send(req.user);
});

// Get endpoint for fetching a specefic user based on their ID.

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
    /* 
    this method didnt work because findByIdAndUpdate bypasses the mongoose middleware and goes straight
    to the database. We have to refactor it so we set a specific save so our middleware can operate
    */
    // const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    //   new: true,
    //   runValidators: true
    // });

    // grabbing the user and using await for the promise
    const user = await User.findById(req.params.id);
    // dynamically setting the fields of the user thorugh the updates object defined above
    updates.forEach(update => (user[update] = req.body[update]));
    // here is where we specifically save user.save() which will allow us to use our middleware right before
    // this function is called
    await user.save();

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
