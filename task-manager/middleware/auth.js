const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = async (req, resp, next) => {
  try {
    // Grabs the token from the headers and removes the Bearer along with the space in from so we just get the
    // token.
    const token = req.header("Authorization").replace("Bearer ", "");
    // Want to check to make sure the token is valid and not expired. jwt.verify does this for us and we
    // pass as arguments the token along with the secret key we defined when creating the token.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    /* We want to find one specific user that matches the id that we got from the token, and we also want 
    to check to make sure that the token has not been deleted from the user's token's array.  
    */
    const user = await User.findOne({
      _id: decoded._id,
      // mongoDB notation for querying an array of embedded documents through a key
      "tokens.token": token
    });

    if (!user) {
      // triggers the catch method to run and show the error listed below
      throw new Error();
    }
    // If we get to this point then the user is valid, and the token is valid.
    // Since we already fetched the valid user from the DB we can store the user in the request so the
    // route handle won't have to waste time and fetch the user again we can just access it out of the req.user.
    // We then call the next() to initiate the router to start.
    // We are also adding in the specific token used to authenticate to log out of the specific devise
    req.token = token;
    // Since we already fetched a user from the DB we just take the user information and place it into the
    // req to be passed around while the user is logged in.
    req.user = user;
    next();
  } catch (error) {
    resp.status(401).send({ error: "Please Authenticate" });
  }
};

module.exports = auth;
