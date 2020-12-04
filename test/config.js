const stubTokenAbi = require("../Abi/complify/StubToken.json").abi;
const vaultAbi = require("../Abi/complify/Vault.json").abi;
const erc20Abi = require("../Abi/complify/ERC20.json").abi;
const gasPrice = web3.utils.toWei(web3.utils.toBN(80), "gwei"); // to Do : get From .env file

const gasParams = {
  gasLimit: web3.utils.toHex(6721975),
  gasPrice: gasPrice,
};

module.exports = {
  gasParams,
  stubTokenAbi,
  vaultAbi,
  erc20Abi
};
