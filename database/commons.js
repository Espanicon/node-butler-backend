// database/commons.js
// utility for common data and functions in the database folder

// Imports
//
const { lib } = require("../utils/icon-lib/lib-no-sdk");
const proposalStates = [
  "_active",
  "_completed",
  "_disqualified",
  "_paused",
  "_pending"
];

const sponsorDepositStatus = [
  "bond_approved",
  "bond_received",
  "bond_returned",
  "bond_cancelled"
];

const arrayOfHexEntries = [
  "approve_voters",
  "approved_reports",
  "approved_votes",
  "budget_adjustment",
  "percentage_completed",
  "project_duration",
  "reject_voters",
  "rejected_votes",
  "sponsor_deposit_amount",
  "sponsored_timestamp",
  "submit_progress_report",
  "timestamp",
  "total_budget",
  "total_voters",
  "total_votes"
];

const arrayOfDateEntries = ["sponsored_timestamp", "timestamp"];

const arrayOfLoopEntries = [
  "approved_votes",
  "sponsor_deposit_amount",
  "total_budget",
  "total_votes"
];

const voteTypes = ["_approve", "_reject", "_abstain"];

function parseProposalData(rawProposalData) {
  /*
   * takes raw data from CPS smart contracts and parse it
   */

  let parsedData = { ...rawProposalData };
  const dataKeys = Object.keys(rawProposalData);

  for (let eachKey of dataKeys) {
    if (arrayOfDateEntries.includes(eachKey)) {
      // if entry is of type Date

      // convert from hex to Number
      let dataValue = parseInt(lib.hexToDecimal(rawProposalData[eachKey]));
      // convert from decimal in microseconds to Date
      parsedData[eachKey] = new Date(dataValue / 1000);
    } else if (arrayOfLoopEntries.includes(eachKey)) {
      // if entry is of type loop

      // convert loop in hex to decimal
      parsedData[eachKey] = parseInt(
        lib.fromHexInLoop(rawProposalData[eachKey])
      );
    } else if (arrayOfHexEntries.includes(eachKey)) {
      // if entry is of type Number
      parsedData[eachKey] = parseInt(
        lib.hexToDecimal(rawProposalData[eachKey])
      );
    }
  }

  return parsedData;
}

module.exports = {
  proposalStates,
  sponsorDepositStatus,
  voteTypes,
  arrayOfHexEntries,
  arrayOfDateEntries,
  arrayOfLoopEntries,
  parseProposalData
};
