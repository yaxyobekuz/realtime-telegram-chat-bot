require("./db/connectDB");
const { server } = require("./app");
const { port } = require("../config");

require("./socket");
require("./start/routes");

server.listen(port, () => {
  console.log(`Server http://localhost:${port} da ishga tushdi!`);
});
