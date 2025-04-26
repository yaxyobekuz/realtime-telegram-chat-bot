const http = require("http");
const cors = require("cors");
const express = require("express");
const { Server } = require("socket.io");

const app = express();

app.use(cors());
const server = http.createServer(app);

const socket = new Server(server, {
  cors: {
    methods: ["GET", "POST"],
    origin: "http://localhost:5173",
  },
});

module.exports = { socket, app, express, server };
