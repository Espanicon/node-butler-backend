// tests/rest-server.test.js
//
const { getAllCPSProposals } = require("./lib/lib");

const RUN_LOCAL = true;
async function runAsync() {
  let hostname = "api.espanicon.team";

  if (RUN_LOCAL) {
    hostname = "localhost";
  }
  // test getAllCPSProposals
  let query = await getAllCPSProposals(hostname);
  console.log(JSON.stringify(query));
}

runAsync();
