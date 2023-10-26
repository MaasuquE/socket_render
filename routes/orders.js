const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Accept the 'io' object and 'connectedClients' object as arguments
module.exports = (io, connectedClients) => {
  router.post('/place-order', (req, res) => {
    const token = req.headers.authorization;

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const { domain, order, passcode } = req.body;
      if ((decoded.domain !== domain) || (passcode != 'a4fdd64c3ab11abe9f192f77f3982676')) {   //// hash of @ordere!faith@
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!domain || !order) {
        return res.status(400).json({ error: 'Domain and order details are required' });
      }

      // Check if there are available clients in the room
      const availableClients = connectedClients[domain];
      
      if (availableClients && availableClients.size > 0) {
        
        io.to(domain).emit('newOrder', { domain: domain, order_id: order });
        res.json({ status:true,message: 'Order received' });
        console.log("Respose ("+domain+") : [order-id: "+ order+"]");
      } else {
        if (!pendingOrders[domain]) {
          pendingOrders[domain] = [];
        }
        pendingOrders[domain].push({ domain: domain, order_id: order });
        const penOrderNum = pendingOrders[domain].length;
        const msg =  penOrderNum +' order(s) stored for later emission';
        res.json({status:true,message: msg});
        console.log("Respose ("+domain+") : "+msg);
      }
    } catch (error) {
      console.error('JWT Verification error:', error);
      if (!res.headersSent) { // Check if headers have already been sent
        res.status(401).json({ status:false,error: 'Unauthorized jwt verification' });
      }
    }
  });

  return router;
};
