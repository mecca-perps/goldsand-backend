const mongoose = require("mongoose");

const WinnerSchema = new mongoose.Schema({
  timestamp: {
    type: Number,
  },
  walletAddress: {
    type: String,
  },
});

const Winner = mongoose.model("Winner", WinnerSchema);

module.exports = Winner;
