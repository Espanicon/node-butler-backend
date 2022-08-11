// database/schema/networkProposal.js

// Imports
const mongoose = require("mongoose");
/*
 * network proposal schema
 */

const NetworkProposalSchema = new mongoose.Schema({
  apply: {
    was_applied: { type: Boolean, required: [true, "Please specify field"] },
    address: { type: String, required: [true, "Please specify field"] },
    id: { type: String, required: [true, "Please specify field"] },
    name: { type: String, required: [true, "Please specify field"] },
    timestamp: { type: String, required: [true, "Please specify field"] }
  },
  contents: {
    description: { type: String, required: [true, "Please specify field"] },
    title: { type: String, required: [true, "Please specify field"] },
    type: { type: String, required: [true, "Please specify field"] }
  },
  vote: {
    agree: { type: String },
    disagree: { type: String },
    noVote: { type: String }
  },
  endBlockHeight: { type: String, required: [true, "Please specify field"] },
  id: { type: String, required: [true, "Please specify field"] },
  proposer: { type: String, required: [true, "Please specify field"] },
  proposerName: { type: String, required: [true, "Please specify field"] },
  startBlockHeight: { type: String, required: [true, "Please specify field"] },
  height: { type: String, required: [true, "Please specify field"] }
});

module.exports = {
  NetworkProposalSchema
};
