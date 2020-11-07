"use strict";
const delay = require("delay");
const paused = parseInt(process.env.DELAY_MS || "5000");
const { web3, vaultFactory, vaultAbi } = require("./contracts");

const gasParams = {
  gasLimit: web3.utils.toHex(5000000),
  gasPrice: web3.utils.toHex(20000000000),
};

const pk = "0x0db827447f7116c29230d46c2e9c951d33e03d9e5e0b1004600e4453dd8fa665";
web3.eth.accounts.wallet.add(pk);
const myWalletAddress = web3.eth.accounts.wallet[0].address;

console.log("My Account Address :  ", myWalletAddress);

(async () => {
  const {
    derivativeSpecificationRegistry,
    oracleRegistry,
    collateralTokenRegistry,
    collateralSplitRegistry,
    createVault,
    getLastVaultIndex,
    getVault,
    getAllVaults,
    // tokenBuilder,
    // feeLogger,
    // protocolFee,
  } = vaultFactory.methods;

  console.log(" Vault Factory Address : ", vaultFactory._address);
  console.log(
    " derivativeSpecificationRegistry : ",
    await derivativeSpecificationRegistry().call()
  );
  console.log(
    " collateralTokenRegistry : ",
    await collateralTokenRegistry().call()
  );
  console.log(
    " collateralSplitRegistry : ",
    await collateralSplitRegistry().call()
  );
  console.log(" oracleRegistry : ", await oracleRegistry().call());

  console.log("/// ///////////////////////////////////////////////");

  const instrument = "BTCx5-USDT";
  const derivativeCreated = Math.floor(Date.now() / 1000);
  console.log(
    "Creating vault " + instrument + " initialized at " + derivativeCreated
  );

  //   const tx = await createVault(
  //     web3.utils.keccak256(instrument),
  //     derivativeCreated
  //   ).send({
  //     from: myWalletAddress,
  //     ...gasParams,
  //   });

  //   console.log(tx);

  console.log(await getAllVaults().call());

  // const lastVaultIndex = await getLastVaultIndex().call();
  // console.log("Vault created index " + lastVaultIndex);
  // const vaultAddress = await getVault.call(lastVaultIndex);
  // console.log("Vault created " + vaultAddress);
  // const vaultContractInstance = new web3.eth.Contract(vaultAbi, vaultAddress);

  // const tx = new vaultContractInstance.methods.initialize();
})();

// const VaultFactory = artifacts.require("VaultFactory");
// const VaultFactoryProxy = artifacts.require("VaultFactoryProxy");
// const Vault = artifacts.require("Vault");

// const paused = parseInt( process.env.DELAY_MS || "5000" );

// const delay = require('delay');
// const wait = async (param) => { console.log("Delay " + paused); await delay(paused); return param;};

// module.exports = async (done) => {
//   const networkType = await web3.eth.net.getNetworkType();
//   const networkId = await web3.eth.net.getId();
//   const accounts = await web3.eth.getAccounts();
//   console.log("network type:" + networkType);
//   console.log("network id:" + networkId);
//   console.log("accounts:" + accounts);

//   let INSTRUMENTS = [];
//   if(networkId === 1) {
//     INSTRUMENTS = [
//       "BTCx5-USDT",
//       "InsurETH",
//       "StabBTC",
//       "CallBTC",
//       "CallETH",
//       "BTCx5-USDC",
//       "ETHx5-USDC",
//       "InsurBTC",
//       "StabETH",
//       "InsurLINK",
//       "CallLINK",
//       "EURx5-USDC",
//       "GBPx5-USDC",
//       "JPYx5-USDC",
//       "GOLDx5-USDC",
//       "N225x5-USDC",
//       "FTSEx5-USDC",
//       "SynthGAS",
//       "ETHx5-USDT",
//       "EURx5-USDT",
//       "GBPx5-USDT",
//       "JPYx5-USDT",
//       "GOLDx5-USDT",
//       "N225x5-USDT",
//       "FTSEx5-USDT",
//     ];
//   } else {
//     INSTRUMENTS = [
//       "InsurASSET",
//       "CallASSET",
//       "ASSETx5",
//       "StabASSET",
//       "ASSETx1"
//     ];
//   }

//   const vaultFactoryAddress = (await VaultFactoryProxy.deployed()).address;
//   const vaultFactory = await VaultFactory.at(vaultFactoryAddress);

//   const derivativeCreated = Math.floor(Date.now() / 1000);

//   for(const instrument of INSTRUMENTS) {
//     try {
//       console.log("Creating vault " + instrument + " initialized at " + derivativeCreated);
//       await wait(await vaultFactory.createVault(web3.utils.keccak256(instrument), derivativeCreated));
//       const lastVaultIndex = await vaultFactory.getLastVaultIndex.call();
//       console.log("Vault created index " + lastVaultIndex);
//       const vaultAddress = await vaultFactory.getVault.call(lastVaultIndex);
//       console.log("Vault created " + vaultAddress);
//       try {
//         await wait(await (await Vault.at(vaultAddress)).initialize());
//       } catch {
//         // second try if the first is failed
//         await wait(await (await Vault.at(vaultAddress)).initialize());
//       }
//       console.log("Vault initialized " + vaultAddress);
//     } catch(e) {
//       console.log(e);
//       done();
//     }
//   }

//   done();
// };
