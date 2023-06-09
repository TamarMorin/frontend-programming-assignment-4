## Submission:
1. Submission is in pairs, but it's better for practice if you start alone.
2. Grades: code part: 70%, questions: 30%.
3. Your submitted git repo should be *private*, please make barashd@post.bgu.ac.il a collaborator.
5. Deadline: 13/06/2023, end of day.
6. Additionally, solve the questions in [will be filled later](https://www.notexists.bgu.ac.il/).
7. To submit, fill in repository details in the following Moodle (https://moodle.bgu.ac.il/moodle/mod/questionnaire/view.php?id=2472729).
8. in Atlas: Set the allowed IP addresses to 'all' (0.0.0.0).
9. Download the final submitted version to a new dir and make sure it installs and runs correctly, preferably on a fresh machine.
10. Start from your previous, hw2-video, submission.

## Goals
1. support user management with authentication.
2. practice backend testing, it's recommended to use test driven development; see tips for TDD below.

## Task
This task's main goal is to add profiles to our posts website; the task is split to:
1. user management: replace nextAuth with token auth from [fullstackopen part 4](https://fullstackopen.com/en/part4/user_administration).
2. back end: supporting routes, db and middleware.
3. front end: profile page, sign up page, and sign in page.
4. backend testing: you have to submit at least 10 backend tests.

## Prerequisite reading:
1. Read about testing, user administration, and authentication at https://fullstackopen.com/en/part4/.
2. Read about bcrypt format: https://en.wikipedia.org/wiki/Bcrypt.
3. Read about JSON Web Token: https://jwt.io/introduction.
4. Read about implementing middleware in Next.js: https://nextjs.org/docs/pages/building-your-application/routing/middleware.

## Implementation - backend
### Library
Remove the next-auth lib from the project. (** See what was added to support it here: https://next-auth.js.org/)

### Database
We need to store the password hashes. you're free to design/move the users database schema as you wish. There are at least two possible options (you can come up with more):
1. Use the existing prisma user table to store passwords as well.
2. if you prefer working with Mongo, and be aligned with fullstackopen examples, you can change your code to store users and their passwords there.

In any case, the posts should stay at the Prisma db.

### API routes
1. implement a route that adds a new user.
2. implement a route that logs in an existing user.
   You can implement extra routes as needed.

### middleware
Implement a middleware to verify a user is logged in, before reaching the API endpoints which are meant for authenticated users. For example: posting, publishing, user profile, etc.


## Implementation - Front
1. for unauthenticated users:
   1. create a "sign in" page: where a user can create an account.
   2. each user must have a username (fix: assume username unique identifier, won't be checked), password, email (unique identifier), and name. (Bonus: a photo, see below).
   3. create a  "log in" page with username/password.
   4. unauthenticated users can still see the public feed.
2. create a profile page for authenticated users. link: on the main page of the app.
   1. Clicking on it, shows a page with the details of the current user.
3. for simplicity, the username, password, and email cannot be changed after user creation, and we don't support user deletion.

## Implementation - front&back end error handling:
1. If a user inserted a bad input in the form, it should be verified in the front end.
2. The backend should send proper status codes (200- ok, 204- success and no content, 201- created, 400 bad request, 403-forbidden, 404- doesn't exist, 500- internal server error, and maybe others). The frontend should show the user matching, informative messages. interpreting those. For example:
   1. A user cannot create an existing other user's email address: this will return a bad request code.
   2. A user must enter an email and cannot leave the input empty, it can be verified at the front end.
   3. If a user inserts an incorrect username/password combo, "incorrect credentials" should show on screen.

### Bonus: up to 10 points ("magen" for the exercises) for extra features:
1. Let the user add a profile picture. Save it to Cloudinary.
2. Make the photo editable with a click, at the profile page.
3. Wherever there's a post shown, add the profile picture of the author.

### Tips - debugging:
Try the [vscode debugger for nextjs.](https://nextjs.org/docs/pages/building-your-application/configuring/debugging), it's easy to install and use most of the time, but sometimes the breakpoints don't work.

### Tips - Test Driven Development
1. This exercise is an opportunity to practice TDD, which will make you a better programmer.
   1. NB: You *have* to submit a set of tests, even if not using TDD.
2. The three laws of TDD: (Taken from "Clean Code"/ Robert C. Martin, Chapter 9, unit tests)
   _Production_ here means code to complete the task itself:
   1. You may not write production code until you have written a failing unit test.
   2. You may not write more of a unit test than is sufﬁcient to fail, and not compiling is failing.
   3. You may not write more production code than is sufﬁcient to pass the currently failing test.

   These three laws lock you into a cycle that is perhaps thirty seconds long. The tests and the production code are written together, with the tests just a few seconds ahead of the production code.
3. building a domain-speciﬁc language for your tests. Rather than using the APIs that programmers use to manipulate the system, build up a set of functions and utilities that make use of those APIs and that make the tests more convenient to write and easier to read. For example:
   _nonExistingId()_ will return a non-existing database id, instead of writing the actual code to generate that id.
4. One comfortable way to write a single test is the "given-when-then" convention:
   1. given that a user is in the database, and a correct auth request is made, then success is expected.
   2. given an existing post id, a delete request is sent to /api/post/:id, then the post should no longer be in the database.
   3. A matter of taste: if the "then" clause expects more than one result, separate each one to a different test, and don't have one long test with multiple expected results. (at the cost of code duplication, but "beforeEach" can save code duplication here.).


### Grading process:
1. Clone your submitted repo.
2. Manually test the profile features and the testing functions.

### Getting started-
See the previous homework instructions.

## Good luck!


