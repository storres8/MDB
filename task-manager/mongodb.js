const mongodb = require("mongodb");

// mongo client allows us to connect to the mongo database
const MongoClient = mongodb.MongoClient;

// Must define connection url and the db you're connecting to
const connectionURL = "mongodb://127.0.0.1:27017";
const databaseName = "task-manager";

const options = {
  useNewUrlParser: true
};

const connectCallback = (error, client) => {
  if (error) {
    return console.log("connection was unsuccessful");
  }

  const db = client.db(databaseName);
  const tasks = [
    {
      "walk the dog": true
    },
    {
      "wash dishes": true
    },
    {
      "study for exam next week": false
    }
  ];
  const tasksCB = (error, result) => {
    if (error) {
      return console.log(error.message);
    }
    return result.ops;
  };
  db.collection("tasks").insertMany(tasks, tasksCB);
};

MongoClient.connect(connectionURL, options, connectCallback);
