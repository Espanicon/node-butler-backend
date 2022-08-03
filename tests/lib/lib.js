// tests/lib/lib.js
//
// Imports
require("dotenv").config();
const NodeButlerSDK = require("../../utils/customLib");

const lib = new NodeButlerSDK();

const { queryMethod: customRequest, statusType } = lib;

// API routes
async function getAllCPSProposals(hostname) {
  //
  const params = {
    route: "/node-butler/cps-proposals",
    data: false,
    hostname: hostname,
    runOverHttps: hostname === "localhost" ? false : true,
    port: hostname === "localhost" ? process.env.REST_PORT : false
  };

  console.log("Params for request");
  console.log(params);
  const request = await customRequest(
    params.route,
    params.data,
    params.hostname,
    params.runOverHttps,
    params.port
  );

  return request;
}
module.exports = { getAllCPSProposals };
