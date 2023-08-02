# how to implement csrf attack in this project?
1. open postman, send post request to http://localhost:3000/api/post
2. add body params: {title: justTitle, content: justContent, email: sameEmailYouLoggedInWith}
3. add browser cookies sync in postman so that token from browser will be shared with postman
4. uncomment export default csrf(handle) in /api/post/index.ts (last line)
5. you will see that you get response {message: "invalid csrf token"} when using "export default csrf(handle)"
6. you will get normal response when using "export default handle"
