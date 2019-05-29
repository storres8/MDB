// Load in express so this file is connected to the framework
const express = require("express");
// Loading in multer libray
const multer = require("multer");
// initiate a new router variable with express.Router() so the application can load the routes
const router = new express.Router();
const User = require("../models/User");
const auth = require("../middleware/auth");
// Loading in file-type for image handling
const fileType = require("file-type");
// Loading sharp
const sharp = require("sharp");
// const { sendWelcomeEmail, sendCancelEmail } = require("../emails/accounts");

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
    // calling the welcome email function we created in accounts.js
    // sendWelcomeEmail(user.email, user.name);
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
    // sendCancelEmail(req.user.email, req.user.name);
    resp.status(200).send(user);
  } catch (error) {
    resp.status(500).send(error);
  }
});

// Setting up profile pic file uploads for the user
let upload = multer({
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
router.post(
  "/users/me/avatar",
  auth,
  upload.single("avatar"),
  async (req, resp) => {
    // req.file.buffer allows us to access the binary file data that is being passed in.
    // we can only access this data is we do NOT specify a directory where the upload will live.
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 250, height: 250 })
      .png()
      .toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    resp.status(200).send("file uploaded");
  },
  // using the comment below to get rid of error from not using the next variable.
  /* Function needs to always have (error, req, resp, next) as arguments for it to work.
    by including those argumets we're telling express that the function is used specifically 
    used to handle errors.
  */

  // eslint-disable-next-line no-unused-vars
  (error, req, resp, next) => {
    // this catched and displays our error for our file upload.
    resp.status(400).send({ error: error.message });
  }
);

// route to delete avatar
router.delete(
  "/users/me/avatar",
  auth,
  async (req, resp) => {
    if (!req.user.avatar) {
      throw new Error("No avatar photo to delete");
    }
    req.user.avatar = undefined;
    await req.user.save();
    resp.status(200).send("Avatar Successfully Deleted");
  },
  // eslint-disable-next-line no-unused-vars
  (error, req, resp, next) => {
    resp.status(503).send({ Error: error.message });
  }
);

// Fetching avatar image for a user through the user ID
router.get("/users/:id/avatar", async (req, resp) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || !user.avatar) {
      throw new Error("Error no image found");
    }
    // Here we are setting a response header so the browser knows how to open the image.
    // 1st argument is the name of the response header and the 2nd argument is the value.
    const TypeOfFile = fileType(user.avatar);
    // using fileType returs an object with 2 keys the "ext" and "mime"

    resp.set("Content-Type", TypeOfFile.mime);
    resp.send(user.avatar);
  } catch (error) {
    resp.status(404).send({ Error: error.message });
  }
});

module.exports = router;
