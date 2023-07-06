
const express = require('express');
const router = express.Router();
const passport = require('passport');
const mailer=require('./SendMailer')
const ResetPass = require('../../models/resetpass');
const User = require('../../models/user');
const jwt = require('jsonwebtoken');


// //get all users
router.get('/users', async (req, res) => {
    try {
        // const UserModel = await User();
        const users = await User.findAll();
        res.json(users);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});
router.post('/users', async (req, res) => {
  try {
   
   
    const token = req.headers.authorization; // Get the token from the request headers
    // console.log(token);
    // Verify and decode the token to extract the user ID
    // const decodedToken = verifyToken(token); // Implement the logic to verify and decode the token
   
      const decoded = jwt.verify(token,'TOPSECRET', { ignoreExpiration: true });

      console.log(decoded);
       // Access the email from the decoded payload
      const email = decoded.user.email;
     
    
    
    // if (!decodedToken) {
    //   return res.status(401).json({ error: 'Invalid token' });
    // }

    console.log(email); // Extract the user ID from the decoded token
   
    const userData = req.body; // Get the updated user data from the request body
    console.log(userData);
   // Update the user in the database based on email or username
   try {
    const updatedUser = await User.update(userData, {
      where: {
        email: email,
      },
      returning: true,
    });
    console.log(updatedUser); // Access the updated user record
  } catch (error) {
    console.error('Error updating user:', error.message);
  }

    console.log('data updated')
    // Return the updated user as the response
    res.status(200).json({success:true,message:'Data updated'});
  } catch (error) {
    // Handle any errors that occur during user update
    res.status(400).json({ error: error.message });
  }
});

router.delete('/users', async (req, res) => {
  try {
    const { token } = req.params;

    // Delete the record based on the token value
    const deletedRows = await User.destroy({ where: { } });

    if (deletedRows > 0) {
      res.status(200).json({ success: true, message: 'Record deleted successfully' });
    } else {
      res.status(404).json({ success: false, message: 'Record not found' });
    }
  } catch (error) {
    console.error('Error deleting record:', error);
    res.status(500).json({ success: false, message: 'An error occurred while deleting the record' });
  }
});


router.post(
  '/signup',
  passport.authenticate('signup', { session: false }),
  async (req, res, next) => {
     const {username,email} = req.body;
    //  console.log(username);
          // Send the verification email
      try{
          mailer.sendVerificationEmail(username, email,false);
      
          res.status(200).json({ success: true, message: 'User Created and Email Sent to registered Id for verification' });
     } catch (error) {
      console.error('Error storing reset token:', error);
      res.status(500).json({ success:false, error: 'An error occurred while storing the reset token.' });
    }

  }
);

router.delete('/resetpass', async (req, res) => {
  try {
    const { token } = req.query;

    // Delete the record based on the token value
    const deletedRows = await ResetPass.destroy({ where: { resetToken: token } });

    if (deletedRows > 0) {
      res.status(200).json({ success: true, message: 'Record deleted successfully' });
    } else {
      res.status(404).json({ success: false, message: 'Record not found' });
    }
  } catch (error) {
    console.error('Error deleting record:', error);
    res.status(500).json({ success: false, message: 'An error occurred while deleting the record' });
  }
});




module.exports = router;
