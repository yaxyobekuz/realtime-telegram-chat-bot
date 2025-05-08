const { app, express } = require("../app");
const chatsRoute = require("../routes/chatsRoute");
const messagesRoute = require("../routes/messagesRoute");

app.use(express.json());
app.use("/api/chats", chatsRoute);
app.use("/api/messages", messagesRoute);
