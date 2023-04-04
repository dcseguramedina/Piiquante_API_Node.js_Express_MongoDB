//Import the JSON web tokens package for the authorization
const jwt = require('jsonwebtoken');

//Extract the token of the authorization header from the incoming request to verify that the request is authenticated
module.exports = (req, res, next) => {
   try {      
       //Use the split function to recover everything after the space in the header
       const token = req.headers.authorization.split(' ')[1];
       //Use the verify function to decode the token
       const decodedToken = jwt.verify(token, process.env.AUTH_TOKEN);
       //Extract the user ID from othe token and add it back to the request object in order to allow the different routes to exploit it
       const userId = decodedToken.userId;
       req.auth = {
           userId: userId
       };
	next();
   } catch(error) {
       res.status(401).json({ error });
   }
};