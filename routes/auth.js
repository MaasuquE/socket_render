const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Create a dictionary to store tokens by domain
const domainTokens = {};

router.get('/generate-token', (req, res) => {
  const domain = req.query.domain;

  if (!domain) {
    return res.status(400).json({ error: 'Domain is required' });
  }

  // Check if a token already exists for the domain
  if (domainTokens[domain]) {
    const token = domainTokens[domain];
    res.json({ token });
  } else {
    // Generate a new token for the domain
    const token = jwt.sign({ domain }, process.env.JWT_SECRET);

    // Store the token for the domain
    domainTokens[domain] = token;

    res.json({ token });
  }
});

module.exports = router;
