// utils/customLib.js
//
// Imports
const EspaniconSDKNode = require("@espanicon/espanicon-sdk");
const url = require("url");
const customRequest = require("./customRequest");
// const { proposalStates } = require("../database/commons");
// console.log("proposal states");
// console.log(proposalStates);

class NodeButlerSDK extends EspaniconSDKNode {
  constructor() {
    super();
    this.getCPSMissingProposalsKeys = this.getCPSMissingProposalsKeys.bind(
      this
    );
    this.getCPSMissingProposals = this.getCPSMissingProposals.bind(this);
    this.getPrepsDetails = this.getPrepsDetails.bind(this);
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

  async getPrepsDetails(detailsLink) {
    const parsedUrl = url.parse(detailsLink);
    const request = await customRequest(
      parsedUrl.path,
      false,
      parsedUrl.host,
      parsedUrl.protocol === "https:" ? true : false
    );

    if (request == null) {
      // Error was raised and handled inside customRequest, the returned value
      // is null. Here we continue returning null and let the code logic
      // after this handle the null values in the most appropiate way depending
      // on the code logic
      return request;
    } else {
      return request;
    }
  }
}

module.exports = NodeButlerSDK;
