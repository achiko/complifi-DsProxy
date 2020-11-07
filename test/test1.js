const Helper = artifacts.require("Helper");
const stubTokenAbi = require("../Abi/complify/StubToken.json").abi;
const vaultAbi = require("../Abi/complify/Vault.json").abi;

const gasPrice = web3.utils.toWei(web3.utils.toBN(80), "gwei");

const gasParams = {
  gasLimit: web3.utils.toHex(6721975),
  gasPrice: gasPrice,
};

contract.skip("Helper", async (accounts) => {
  const collateralAddress = "0x53Fd14044a69BcE6edd9A066B85395b2dB4D41E4"; // stub token
  const vaultAddress = "0xD2D4eA30D7781F38f30A17D094235764480D04C2";

  let helperInstance;

  describe("Helper Test", () => {
    before(async () => {
      helperInstance = await Helper.deployed();
    });

    it("... Check Balances ", async () => {
      const stubTokenInstance = new web3.eth.Contract(
        stubTokenAbi,
        collateralAddress
      );

      const vaultInstance = new web3.eth.Contract(vaultAbi, vaultAddress);

      const {
        symbol,
        name,
        decimals,
        balanceOf,
        allowance,
      } = stubTokenInstance.methods;

      console.log("Symbol : ", await symbol().call());
      console.log("Name: ", await name().call());
      console.log("Decimals : ", await decimals().call());
      console.log("Balance : ", await balanceOf(accounts[2]).call());
      console.log(
        "Allowance : ",
        await allowance(accounts[2], vaultAddress).call()
      );

      console.log("Vault Balance : ", await balanceOf(vaultAddress).call());

      // eslint-disable-next-line prettier/prettier
      const tx = await vaultInstance.methods
        .mint(1)
        .send({ from: accounts[2], ...gasParams });

      console.log(tx);
      console.log("Balance : ", await balanceOf(accounts[2]).call());

      // console.log(helperInstance.methods);
      // const stubTokenBalance = await helperInstance.methods
      //   .getCollateralBalance(collateralAddress, userAccount)
      //   .call();

      //   const result = await helperInstance.getCollateralBalance(
      //     collateralAddress,
      //     userAccount
      //   );
      //   console.log(result);

      // console.log(stubTokenBalance);
      // assert.equal(true, true);
    });
  });
});
