// tests/lib/lib.js
//
// Imports
require("dotenv").config();
const customRequest = require("../../espanicon-sdk/utils/customRequest");

// global var declarations
const statusType = [
  "_active",
  "_completed",
  "_disqualified",
  "_paused",
  "_pending"
];

// API routes
async function getAllCPSProposals(hostname = false) {
  //
  const request = await customRequest(
    "/node-butler/cps-proposals",
    false,
    hostname ? hostname : null,
    hostname ? false : true,
    hostname ? process.env.REST_PORT : false
  );

  return request;
}
module.exports = { getAllCPSProposals };
