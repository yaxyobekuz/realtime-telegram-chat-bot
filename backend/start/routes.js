const { app, express } = require("../app");
const chatsRoute = require("../routes/chatsRoute");

app.use(express.json());
app.use("/api/chats", chatsRoute);
