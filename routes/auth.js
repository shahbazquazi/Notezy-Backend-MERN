const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchUser = require('../middleware/fetchuser');


const jwtPass = process.env.JWT_SECRET_KEY;

//Route 1: Create a user using : POST "/api/auth/createuser"- No login required
router.post('/createuser', [body('email', 'Enter a valid email').isEmail(), body('name', 'Enter your name').isLength({ min: 3 }), body('password', 'Password must be atleast 5 characters').isLength({ min: 5 })], async (req, res) => {
  let success = false;
  //showing error for wrong request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({success, errors: errors.array() });
  }
  // Check whether the email exists
  try {
    let user = await User.findOne({ email: req.body.email });
    if (user) {
      return res.status(400).json({success, error: "Sorry a user with this email is already exists" });
    }
    //Add password security by bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashPass = await bcrypt.hash(req.body.password, salt);
    user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: hashPass,
    });
    const data = {
      user: {
        id: user.id
      }
    }
    success = true;
    const authToken = jwt.sign(data, jwtPass);
    res.json({success, authToken });

  } catch (error) {
    console.log({ error: error.message });
    res.status(500).send("Internal Server Error");
  }
});

//Route 2: Authenticate a user using : POST "/api/auth/login"
router.post('/login', [body('email', 'Enter a valid email').isEmail(), body('password', 'Password cannot be empty').exists()], async (req, res) => {

  //showing error for wrong request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let success = false;
    return res.status(400).json({success, errors: errors.array() });
  }

  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      let success = false;
      return res.status(400).json({success, error: "Credentials are not matched" });
    }
    const passCompare = await bcrypt.compare(password, user.password);
    if (!passCompare) {
      let success = false;
      return res.status(400).json({success, error: "Credentials are not matched" });
    }
    const data = {
      user: {
        id: user.id
      }
    }
    const authToken = jwt.sign(data, jwtPass);
    let success = true;
    res.json({success,email, authToken });

  } catch (error) {
    console.log({ error: error.message });
    res.status(500).send("Internal Server Error");
  }

});

//Route 3: Get loggedin user details using: POST "/api/auth/getuser"- login required
router.post('/getuser',fetchUser, async (req, res) => {

  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    res.send(user);
  } catch (error) {
    console.log({ error: error.message });
    res.status(500).send("Internal Server Error");
  }

});


module.exports = router;