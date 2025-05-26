require("./connectDB");
const { server } = require("./app");
const { port } = require("../config");
const messagesModel = require("./models/messagesModel");

require("./start/routes");
require("./socketConnection");

(async () => {
  const savedMessages = await messagesModel.findOne({ id: "saved" });

  if (savedMessages) return;

  const createdSavedMessages = new messagesModel({
    id: "saved",
    messages: [],
    user: { id: 0, username: null },
  });

  await createdSavedMessages.save();
})();

server.listen(port, () => {
  console.log(`Server http://localhost:${port} da ishga tushdi!`);
});
