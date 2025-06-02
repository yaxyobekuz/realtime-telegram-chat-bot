const { app, express } = require("../app");
const chatsRoute = require("../routes/chatsRoute");
const paymentsRoute = require("../routes/paymentsRoute");

app.use(express.json());
app.use("/api/chats", chatsRoute);
app.use("/api/payments", paymentsRoute);
