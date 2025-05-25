require("./connectDB");
const { server } = require("./app");
const { port } = require("../config");
const chatModel = require("./models/chatModel");

require("./start/routes");
require("./socketConnection");

(async () => {
  const savedMessagesChat = await chatModel.findOne({ id: "saved" });

  if (savedMessagesChat) return;

  const newChat = new chatModel({
    id: "saved",
    user: { id: 0, username: null },
  });

  await newChat.save();
})();

server.listen(port, () => {
  console.log(`Server http://localhost:${port} da ishga tushdi!`);
});
