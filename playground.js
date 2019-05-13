require("../MDB/task-manager/db/mongoose");
const Task = require("../MDB/task-manager/models/Task");

// Task.findByIdAndDelete("5cd5aa420c447a0f2b153046")
//   .then(task => {
//     console.log(`removed ${task}`);
//     return Task.countDocuments({ completed: false });
//   })
//   .then(result => {
//     console.log(`You have ${result} task(s) that are not yet completed`);
//   })
//   .catch(errors => console.log(errors));

const deleteTaskAndCount = async id => {
  await Task.findByIdAndDelete(id);
  const count = await Task.countDocuments({ completed: false });
  return count;
};

deleteTaskAndCount("5cd7ab7f17650d4ccc8ae94c")
  .then(count => console.log(`You have ${count} task(s) not completed`))
  .catch(error => console.log(error));
