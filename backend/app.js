const http = require("http");
const cors = require("cors");
const express = require("express");
const { Server } = require("socket.io");
const { objectDBConfig } = require("../config");
const { S3Client, ListBucketsCommand } = require("@aws-sdk/client-s3");

const app = express();

app.use(cors());
const server = http.createServer(app);

const socket = new Server(server, {
  cors: {
    methods: ["GET", "POST", "DELETE", "PUT"],
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://realvaqt-chat.netlify.app",
    ],
  },
});

const objectDB = new S3Client(objectDBConfig);

module.exports = { socket, app, express, server, objectDB };
