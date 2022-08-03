// utils/customLib.js
//
// Imports
const EspaniconSDKNode = require("@espanicon/espanicon-sdk");

class NodeButlerSDK extends EspaniconSDKNode {
  constructor() {
    super();
    this.getCPSMissingProposalsKeys = this.getCPSMissingProposalsKeys.bind(
      this
    );
    this.getCPSMissingProposals = this.getCPSMissingProposals.bind(this);
  }
  async getCPSMissingProposalsKeys(currentProposalsInDb = []) {
    // compares the hash of the proposals that are currently in the db with all
    // the proposals in the ICON Network and returns a list of the keys of the
    // missing proposals
    let missingProposalsKeys = [];

    for (let eachStatus of this.statusType) {
      const proposalsKeys = await this.getCPSProposalKeysByStatus(eachStatus);

      proposalsKeys.map(eachKey => {
        if (currentProposalsInDb.includes(eachKey)) {
          // do nothing
        } else {
          missingProposalsKeys.push(eachKey);
        }
      });
    }

    return missingProposalsKeys;
  }
  async getCPSMissingProposals(currentProposalsInDb = []) {
    // compares the hash of the proposals that are currently in the db with all
    // the proposals in the ICON Network and only dowloads the missing ones
    const missingProposalsKeys = await this.getCPSMissingProposalsKeys(
      currentProposalsInDb
    );
    let missingProposals = [];

    for (let eachProposal of missingProposalsKeys) {
      console.log(`fetching ${eachProposal}`);
      const proposal = await this.getCPSProposalDetailsByHash(eachProposal);
      const comments = await this.getCPSProposalVoteResultsByHash(eachProposal);

      missingProposals.push({
        proposal: proposal,
        comments: comments
      });
    }

    return missingProposals;
  }
}

module.exports = NodeButlerSDK;
