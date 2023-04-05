// Import the jsonwebtokens package for the authorization
const jwt = require('jsonwebtoken');

// Extract token of the authorization header to verify that a request is authenticated
module.exports = (req, res, next) => {
   try {      
       // Use split function to recover everything after the space in the header
       const token = req.headers.authorization.split(' ')[1];
       // Use verify function to decode the token
       const decodedToken = jwt.verify(token, process.env.AUTH_TOKEN);
       // Extract userId from a token and add it back to the request object to allow routes to exploit it
       const userId = decodedToken.userId;
       req.auth = {
           userId: userId
       };
	next();
   } catch(error) {
       res.status(401).json({ error });
   }
};