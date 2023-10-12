const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());
// Accept the 'io' object as an argument
module.exports = (io) => {
  router.post('/place-order', (req, res) => {
    const { domain, order } = req.body;
    console.log(req.body);
    if (!domain || !order) {
      return res.status(400).json({ error: 'Domain and order details are required' });
    }
    console.log(domain);
    io.to(domain).emit('newOrder', {doamin:domain, order_id:order});
    res.json({ message: 'Order received' });
  });

  return router;
};
