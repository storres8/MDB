This is an API created using Node, Express & MongoDB. 

This task manager REST API allows for the creation of a User and for the creation of tasks to be assigned to that user. This API also 
features authentication through JWT tokens. In other words, there is a login endpoint that will dispatch a new JWT token, and with that 
token you may access the other protected endpoints.

This API also has Multer installed which allows for photo files to be uploaded and used as a user's avatar. 

<h3>Routes Include</h3>

POST  <strong>/users/login</strong>
<p>-login with an email and password</p>

POST  <strong>/users</strong>
<p> -register a new account with a name, email, and password </p>
<p> -Generates JWT token to be stores and passed along with the following requests </p>
 
POST  <strong>/users/logout</strong>
<p> -logout out of your current session </p>

POST  <strong>/users/logoutAll</strong>
<p> -loggout of all sessions from all devices </p>

<h4>ONCE logged in, the following routes become accessable</h4>

<h5> --User Routes-- </h5>
GET <strong>/users/me</strong>
<p> -grabs current user profile </p>

PATCH <strong>users/me</strong>
<p> -update an existing user's information </p>

DELETE <strong>/users/me</strong>
<p> -update an existing user's information </p>

POST <strong>/users/me/avatar</strong>
<p> -upload a profile avatar </p>

POST <strong>/users/me/avatar</strong>
<p> -upload a profile avatar </p>

DELETE <strong>/users/me/avatar</strong>
<p> -delete profile avatar </p>

GET <strong>/users/:id/avatar</strong>
<p> -fetch a user avatar image through a user id</p>

<h5> --Task Routes-- </h5>

POST <strong>/tasks</strong>
<p> -upload a new task </p>

GET <strong>/tasks</strong>
<p> -get all current tasks </p>

GET <strong>/tasks/:id</strong>
<p> -get a current task with a task id </p>

PATCH <strong>/tasks/:id</strong>
<p> -patch a specific task with a task id </p>

DELETE <strong>/tasks/:id</strong>
<p> -patch a specific task with a task id </p>

<h3>Remeber all routes after login or register must include the token in with the request.</h3>





