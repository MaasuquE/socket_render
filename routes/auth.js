const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

router.get('/generate-token', (req, res) => {
  const domain = req.query.domain;
  console.log(domain);
  if (!domain) {
    return res.status(400).json({ error: 'Domain is required' });
  }

  const token = jwt.sign({ domain }, process.env.JWT_SECRET);
  res.json({ token });
});

module.exports = router;
