// database/schema/preps.js

// Imports
const mongoose = require("mongoose");
/*
 * preps schema
 */

const PrepsSchema = new mongoose.Schema({
  address: {
    type: String,
    required: [true, "Please specify field"],
    validate: {
      validator: v => {
        return /^hx([a-fA-F0-9]{40,40}$)/.test(v);
      },
      message: "{VALUE} is not a valid ICON address"
    }
  },
  details: {
    type: String,
    required: [true, "Please specify field"]
  }
});

module.exports = {
  PrepsSchema
};
