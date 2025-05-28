require("./db/connectDB");
const { server } = require("./app");
const { port } = require("../config");
const messagesModel = require("./models/messagesModel");

require("./socket");
require("./start/routes");

(async () => {
  const savedMessages = await messagesModel.findOne({ id: 1 });

  if (savedMessages) return;

  const createdSavedMessages = new messagesModel({
    id: 1,
    messages: [],
    user: { id: 1, username: null },
  });

  try {
    await createdSavedMessages.save();
  } catch {
    console.log("Saved messages error! ", savedMessages);
  }
})();

server.listen(port, () => {
  console.log(`Server http://localhost:${port} da ishga tushdi!`);
});
