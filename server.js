const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const bodyParser = require('body-parser');
const cors = require('cors');

// Load environment variables
require('dotenv').config();
app.use(bodyParser.json()); 
app.use(cors());


const connectedClients = {};

io.on('connection', (socket) => {
  socket.on('authenticate', (token) => {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const { domain } = decoded;
      // Store the socket object for this client
      connectedClients[domain] = socket;

      // Join the room based on the domain
      socket.join(domain);
      socket.emit("joinRoom",{id:domain});
      console.log(`User authenticated for domain: ${domain}`);
    } catch (error) {
      console.error('Authentication error:', error);
      // Handle authentication error
    }
  });

  socket.on('disconnect', () => {
    // Remove the client from the connectedClients dictionary when they disconnect
    for (const domain in connectedClients) {
      if (connectedClients[domain] === socket) {
        delete connectedClients[domain];
        break;
      }
    }
    console.log('User disconnected');
  });
});

console.log(connectedClients);

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/orders', require('./routes/orders')(io));
server.listen(3000, () => {
  console.log('Server is listening on 3000');
});