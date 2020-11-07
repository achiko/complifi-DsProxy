const Web3 = require("web3");

const web3 = new Web3("");
// const gasPrice = web3.utils.toWei(
//   web3.utils.toBN(process.env.GAS_PRICE_GWEI),
//   "gwei"
// );

const gasPrice = web3.utils.toWei(web3.utils.toBN(10), "gwei");

module.exports = {
  /**
   * Networks define how you connect to your ethereum client and let you set the
   * defaults web3 uses to send transactions. If you don't specify one truffle
   * will spin up a development blockchain for you on port 9545 when you
   * run `develop` or `test`. You can ask a truffle command to use a specific
   * network from the command line, e.g
   *
   * $ truffle test --network <network-name>
   */

  networks: {
    development: {
      host: "localhost", // Localhost (default: none)
      port: 8545, // Standard Ethereum port (default: none)
      network_id: "*", // Any network (default: none)
      gas: "6721975",
    },
    kovan: {
      host: "localhost",
      port: 8545,
      network_id: 42,
      gasPrice: 10000000000, // 10 gwei
      gas: 6900000,
      from: process.env.ETH_FROM,
    },
  },

  // Set default mocha options here, use special reporters etc.
  mocha: {
    // timeout: 100000
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: "0.5.12",
      // docker: true,        // Use "0.5.1" you've installed locally with docker (default: false)
      settings: {
        // See the solidity docs for advice about optimization and evmVersion
        optimizer: {
          enabled: true,
          runs: 200,
        },
        evmVersion: "byzantium",
      },
    },
  },
};
