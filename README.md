## Submission: 
1. Submission is in pairs, but it's better for practice if you start alone.
2. Grades: code part: 70%, questions: 30%.
3. Your submitted git repo should be *private*, please make barashd@post.bgu.ac.il a collaborator.
5. Deadline: 27/05/2023, end of day.
6. Additionally, solve the questions in: (  link will be filled soon.).
7. To submit, fill in repository details in the following Moodle [link].(https://moodle.bgu.ac.il/moodle/mod/questionnaire/view.php?id=2466075).


## Task
this task's main goal about adding videos to our posts website, and is splitted to data transfer from hw1, video part and front end part.
![overview](https://res.cloudinary.com/dqdivzl0r/image/upload/v1684134346/kk6grnofeqgawigeas9f.png)

### Data transfer
1. Reduce number of posts sent from backend to 10.  Read about api routes below.

### Video
1. When a post is created/edited, there will be an option to upload exactly one video to the post, and to remove it. 
2. If a video was uploaded, the user will see the filename, and won't be able to upload any more.
3. The video meta data will be saved in mongoDB. 
Required metadata: user, date uploaded, id of post (sqlite),  link to video (cloudinary). 
4. We will save the video files in cloudinary. 

### Front end components
1.  automatic focus on the text box in the create post page.
2.  if a video exists, it should appear, when the containing post is opened.

### Bonus: 0-10 points ("magen" for the exercises) for extra features:
1. implement a light/dark theme button for all frontent components (under "components" directory). See For example, https://react.dev/learn,  top right corner.
2. add a spinner icon while uploading/downloading videos. (see example from tpiros.dev)
3. on the main page, add a video icon next to posts that have videos inside.
4. if the status changed from online to offline and vice versa- pop an alert. (https://react.dev/learn/you-might-not-need-an-effect)

If a design/user experience option was not specified here: you're free to choose yourself.
It's recommended to write in Typescript, i.e. to add types, but not enforced.

## Prerequisites

### Client side: uploading a video file:
1. Read about formData, which we'll use to send data from the Frontend to the Backend (https://developer.mozilla.org/en-US/docs/Web/API/FormData)
2. Read about fetch API: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Basic_concepts
3. Read about await/async: https://javascript.info/async-await


### Server side: parsing the video file, saving metadata, upload to cloud:
1. read about formidable for parsing forms, specifically read the "with Node.js http module" example: https://www.npmjs.com/package/formidable
2. Follow the first upload file tutorial and open an account in https://cloudinary.com/ ![cloudinary first e2e](https://res.cloudinary.com/dqdivzl0r/image/upload/v1684131345/cloudinary_xkdnx7.png )

3. Read about creating api routes, in https://nextjs.org/learn/basics/api-routes/creating-api-routes.
4. Follow the tutorial on mongoDB, and open an account. (https://fullstackopen.com/en/part3/saving_data_to_mongo_db)
5. Follow the full upload video to cloudinary example [here](https://tpiros.dev/blog/uploading-and-displaying-videos-with-nextjs/) 

### Tips:
1. It's good to commit whenever you finish a small step and the project is working. The goal is to have a safe point to return to.
2. Work in small steps, follow the browser debugger and the server debugger for errors. Fix as soon as they happen.
3. You can use the _debugger_ keyword, console.log(), those would work for front end and partially backend code. Another option is configure the [vscode debugger for nextjs.](https://nextjs.org/docs/pages/building-your-application/configuring/debugging)

### Github 
Like before, Hw2 will be submitted via Github: fill the group in the moodle link.

### Grading process:
1. Clone your submitted repo. 
2. Run the starter scripts.
3. Perfomance test against a large database from hw1.
4. Manually test the video feature and any extra features.

### Getting started- 
See the previous homework instructions.

## Good luck!



