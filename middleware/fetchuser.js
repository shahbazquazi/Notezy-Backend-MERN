const jwt = require('jsonwebtoken');
 
const fetchUser = (req,res,next)=>{
   //Get the user from jwt token and add to request object.
   const token = req.header('Auth-Token');
   const jwtPass = process.env.JWT_SECRET_KEY;
   if(!token){
    res.status(401).send({error:"Please authenticate with a valid token"});
   }
   try {
    const data = jwt.verify(token, jwtPass);
    req.user = data.user;
     next(); 
   } catch (error) {
    res.status(401).send({error:"Please authenticate with a valid token"});
   }
  
};

module.exports = fetchUser;