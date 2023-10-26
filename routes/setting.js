const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Accept the 'io' object as an argument
module.exports = (io) => {
  router.post('/setting-data', (req, res) => {
    const token = req.headers.authorization;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const { domain, settings } = req.body;

      // Check if the 'domain' in the token matches the 'domain' in the request
      if (decoded.domain !== domain) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!domain || !settings) {
        return res.status(400).json({ error: 'Domain and settings are required' });
      }

      io.to(domain).emit('updatedSettings', { domain: domain, settings: settings });
      res.json({ message: 'Setting updated' });
    } catch (error) {
      console.error('JWT Verification error:', error);
      return res.status(401).json({ error: 'Unauthorized' });
    }
  });

  return router;
};
