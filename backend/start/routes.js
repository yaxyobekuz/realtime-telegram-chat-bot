const { app, express } = require("../app");
const chatsRoute = require("../routes/chatsRoute");
const profilePhotoRoutes = require("../routes/profilePhoto");

app.use(express.json());
app.use("/api/chats", chatsRoute);
app.use("/api", profilePhotoRoutes);
