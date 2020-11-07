const Web3 = require("web3");
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.RPC_HTTP));

const vaultFactoryProxyAddress = "0x74f95b6f51C3FCF0330E8bcDbE365E6F54CC858A";

const vaultFactoryAbi = require("../Abi/complify/VaultFactory.json").abi;
const vaultFactoryProxyAbi = require("../Abi/complify/VaultFactoryProxy.json")
  .abi;
const vaultAbi = require("../Abi/complify/Vault.json").abi;

const vaultFactoryProxy = new web3.eth.Contract(
  vaultFactoryProxyAbi,
  vaultFactoryProxyAddress
);
const vaultFactory = new web3.eth.Contract(
  vaultFactoryAbi,
  vaultFactoryProxy._address
);

module.exports = {
  vaultFactoryProxy,
  vaultFactory,
  vaultAbi,
  web3,
};
