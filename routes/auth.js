const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

router.post('/generate-token', (req, res) => {
  const {domain , passcode} = req.body;
  console.log(req.body);
  if (!domain) {
    return res.status(400).json({ status:false,error: 'Domain is required' });
  }
  if (passcode != 'a4fdd64c3ab11abe9f192f77f3982676') {   //// hash of @ordere!faith@
    return res.status(401).json({ status:false,error: 'Unauthorized' });
  }

  const token = jwt.sign({ domain }, process.env.JWT_SECRET);
  res.json({ status:true,token });
});

module.exports = router;