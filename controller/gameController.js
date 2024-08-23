const Player = require("../Model/Player");
const Winner = require("../Model/Winner");
const { ethers } = require("ethers");

exports.calculateScore = async (req, res) => {
  const { score, walletAddress } = req.body;
  const now = Math.floor(Date.now() / 1000);
  let player = await Player.findOne({ walletAddress: walletAddress });
  if (player) {
    player.score = player.score + score;
    player.lastPlayed = now;
    player.count = player.count + 1;
    await player.save();
  } else {
    const newPlayer = new Player({
      score: score,
      lastPlayed: now,
      count: 1,
      walletAddress: walletAddress,
    });
    await newPlayer.save();
  }

  const result = await Player.findOne({ walletAddress });

  res.send({ message: "success", score: result.score });
};

exports.distributeReward = async (req, res) => {
  const topAddress = await findTopPlayer();
  const rpcUrl = "https://base.llamarpc.com";

  const privateKey = process.env.PRIVATE_KEY;

  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);

  const contractAbi = [
    {
      inputs: [
        {
          internalType: "address",
          name: "_usdcTokenAddress",
          type: "address",
        },
      ],
      stateMutability: "nonpayable",
      type: "constructor",
    },
    {
      stateMutability: "payable",
      type: "fallback",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
      ],
      name: "depositUSDC",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "topPlayer",
          type: "address",
        },
      ],
      name: "distributeReward",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "lastWeekTimestamp",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "owner",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "usdcToken",
      outputs: [
        {
          internalType: "contract IERC20",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "weekDuration",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
      ],
      name: "withdrawEther",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
      ],
      name: "withdrawUSDC",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      stateMutability: "payable",
      type: "receive",
    },
  ];

  const contractAddress = process.env.GAME_CONTRACT_ADDRESS;
  const gameContract = await new ethers.Contract(
    contractAddress,
    contractAbi,
    wallet
  );

  try {
    const res = await gameContract.distributeReward(topAddress);
    if (res) {
      // reset history
      await Player.deleteMany({});
      // register winner
      const newWinner = new Winner({
        timestamp: Math.floor(Date.now() / 1000),
        walletAddress: topAddress,
      });
      newWinner.save();
    }
    res.send({ message: "success" });
  } catch (error) {
    res.send({ message: "failed" });
    console.log(error);
  }
};

const findTopPlayer = async () => {
  const players = await Player.find();
  let topAddress = "";
  let topScore = 0;
  for (const player of players) {
    if (player.score > topScore) {
      topScore = player.score;
      topAddress = player.walletAddress;
    }
  }
  return topAddress;
};

exports.getScore = async (req, res) => {
  const { walletAddress } = req.body;
  const player = await Player.findOne({ walletAddress });
  res.send({ message: "success", score: player.score });
};

exports.getRanking = async (req, res) => {
  const players = await Player.find()
    .sort({
      score: -1,
    })
    .limit(10);

  res.send({ message: "success", players: players });
};
