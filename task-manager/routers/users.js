// Load in express so this file is connected to the framework
const express = require("express");
// Loading in multer libray
const multer = require("multer");
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
    // .generateAuthToken is also custom method build on a specific user instance
    const token = await user.generateAuthToken();
    resp.status(200).send({ user: user, token: token });
  } catch (error) {
    resp.status(400).send(error);
  }
});

// Loggs out user
router.post("/users/logout", auth, async (req, resp) => {
  try {
    let currentToken = req.token;
    // returns an array of tokens that don't include the one being passes in the request & sets that to the
    // current tokens array thereby deleting the token and loggging the user out
    req.user.tokens = req.user.tokens.filter(token => {
      return token.token !== currentToken;
    });
    // Saving the changed made to the user
    await req.user.save();
    resp.status(200).send("Logged Out");
  } catch (error) {
    resp.status(500).send({ error: "loggout failed" });
  }
});

// Logging out of all sessions
router.post("/users/logoutAll", auth, async (req, resp) => {
  try {
    req.user.tokens = [];
    if (req.user.tokens.length > 0) {
      throw new Error();
    }
    await req.user.save();
    resp.status(200).send("Logged Out Of All Sessions");
  } catch (error) {
    resp.satus(500).send(error);
  }
});

// Post endpoint for Creating new Users
router.post("/users", async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    // when a new user gets created we generate a token and they are logged in for the first time
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

// Patch endpoint for updating an existing user's information
router.patch("/users/me", auth, async (req, resp) => {
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
    console.log(req.user);
    const user = req.user;
    // dynamically setting the fields of the user thorugh the updates object defined above
    updates.forEach(update => (user[update] = req.body[update]));
    // here is where we specifically save user.save() which will allow us to use our middleware right before
    // this function is called
    await user.save();

    // if there was a user and data was valid return the updated user
    return resp.status(201).send(user);

    // catch will error out when there was a user but the data wasn't valid so no update
  } catch (error) {
    resp.status(400).send(error);
  }
});

// Delete endpoint for Users
router.delete("/users/me", auth, async (req, resp) => {
  try {
    const user = await User.findByIdAndDelete(req.user._id);
    // await req.user.remove()
    resp.status(200).send(user);
  } catch (error) {
    resp.status(500).send(error);
  }
});

// Setting up profile pic file uploads for the user
let upload = multer({
  dest: "avatars",
  limits: {
    // limits the size of the file that we are uploading.
    // The storage limit amount is in bytes so 1,000,000 bytes is 1 megabyte.
    // Any file > 1,000,000 bytes AKA 1MB will not be uploaded with this route.
    fileSize: 1000000
  },
  // fileFilter function runs when a new file is attempting to upload and can reject it.
  // takes 3 arguments: a request, a file, and a callback function
  /* callback function has 3 ways of using it: 
    1) cb(new Error('file must be pdf')) --> this is how we would throw an error 
    2) cb(undefined, true) --> this is how we accept the file 
    3) cb(undefined, false) --> this does not accept file, but shows no error 
  */
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(
        new Error("Please upload either a .jpg, .jpeg or a .png file.")
      );
    }

    cb(undefined, true);
  }
});
router.post("/users/me/avatar", upload.single("avatar"), (req, resp) => {
  resp.status(200).send("file uploaded");
});

module.exports = router;
