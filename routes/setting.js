const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());
// Accept the 'io' object as an argument
module.exports = (io) => {
  router.post('/setting-data', (req, res) => {
    const { domain, settings } = req.body;
    console.log(req.body);
    if (!domain || !settings) {
      return res.status(400).json({ error: 'Domain and order details are required' });
    }
    io.to(domain).emit('updatedSettings', {doamin:domain, settings:settings});
    res.json({ message: 'Setting updated' });
  });

  return router;
};
