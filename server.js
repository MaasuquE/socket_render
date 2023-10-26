const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
const { error } = require('console');

// Load environment variables
require('dotenv').config();
app.use(bodyParser.json());
app.use(cors());

// Maintain room-wise connected clients
const connectedClients = {}; // Room name to connected clients
global.pendingOrders = {};

io.on('connection', (socket) => {
  socket.on('authenticate', (data) => {
    try {
      const { domain, token } = data;
      
      const url = 'https://'+ domain +'/api/verify-client';
      const requestData = {
        domain: domain,
        token: token
      };

      axios.post(url, requestData, {
        headers: {
          'Authorization': `${token}` 
        },
      })
        .then((response) => {
          if(response.status){
            socket.join(domain);
            socket.emit("joinRoom", { id: domain });
            console.log("Authentication success:", response.data);

            if (!connectedClients[domain]) {
              connectedClients[domain] = new Set();
            }
            connectedClients[domain].add(socket);
            if (pendingOrders[domain] && connectedClients[domain]) {
              const orders = pendingOrders[domain];
              console.log(orders);
              orders.forEach((order) => {
                socket.emit('newOrder', order);
              });
              pendingOrders[domain] =[];
            }
            
          }
        })
        .catch((error) => {
          console.log("Response error:", error.response ? error.response.data : error.message);
        });
    } catch (error) {
      console.error('Authentication error:', error);
    }
  });

  socket.on('disconnect', () => {
    for (const room in connectedClients) {
      if (connectedClients[room].has(socket)) {
        connectedClients[room].delete(socket);
        if (connectedClients[room].size === 0) {
          delete connectedClients[room];
        }
      }
    }
    console.log('User disconnected');
  });
});

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/orders', require('./routes/orders')(io, connectedClients));
app.use('/api', require('./routes/setting')(io, connectedClients));

server.listen(3000, () => {
  console.log('Server is listening on 3000');
});
