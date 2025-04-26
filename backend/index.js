require("./connectDB");
const { server } = require("./app");
const { port } = require("../config");

require("./start/routes");
require("./socketConnection");

server.listen(port, () => {
  console.log(`Server http://localhost:${port} da ishga tushdi!`);
});
