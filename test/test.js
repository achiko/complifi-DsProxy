const BigNumber = require("bignumber.js");
const DSProxyFactory = artifacts.require("DSProxyFactory");
const DSProxy = artifacts.require("DSProxy");
const CallActions = artifacts.require("CallActions");
const stubTokenAbi = require("../Abi/complify/StubToken.json").abi;
const vaultAbi = require("../Abi/complify/Vault.json").abi;
const Black = artifacts.require("Black");

const gasPrice = web3.utils.toWei(web3.utils.toBN(80), "gwei");

const gasParams = {
  gasLimit: web3.utils.toHex(6721975),
  gasPrice: gasPrice,
};

contract("CallActions", async (accounts) => {
  const collateralAddress = "0x5f414D534C4687f493575E3aCB123757b2126eE7"; // stub
  const vaultAddress = "0x0D4771055a2a252DF9c0F449Dc2A2c78A58880EB";
  const user = accounts[2];

  describe("DSProxy", () => {
    let stubTokenInstance;
    let vaultInstance;
    let callActionsInstance;
    let proxyFactory;
    let userProxyAddress;
    let userProxyInstance;

    let blackToken;

    before(async () => {
      blackToken = await Black.new();
      console.log("Black Token Address : ", blackToken.address);
      stubTokenInstance = new web3.eth.Contract(
        stubTokenAbi,
        collateralAddress
      );
      vaultInstance = new web3.eth.Contract(vaultAbi, vaultAddress);
      callActionsInstance = await CallActions.deployed();
      proxyFactory = await DSProxyFactory.deployed();
      userProxyAddress = await proxyFactory.build.call({ from: user }); // Get proxy address
      await proxyFactory.build({ from: user }); // Build proxy
      userProxyInstance = await DSProxy.at(userProxyAddress);
    });

    it("Test Local Stub Token Instance", async () => {
      console.log("Mint Stub Tokens For local User ");
      await blackToken.mint(user, 150);
      const balance = new BigNumber(
        await blackToken.balanceOf(user)
      ).toNumber();
      console.log("_StubToken Balance : ", balance);
      assert.ok(true);
    });

    it.skip("Execute CallAction Method Directly", async () => {
      const { balanceOf, allowance } = stubTokenInstance.methods;
      console.log("Balance : ", await balanceOf(user).call());
      console.log("Allowance : ", await allowance(user, vaultAddress).call());
      const tx = await callActionsInstance.callMint(
        vaultAddress,
        collateralAddress,
        1,
        { from: user, ...gasParams }
      );

      console.log(tx);

      console.log("Allowance : ", await allowance(user, vaultAddress).call());

      assert.ok(true);
    });

    it("... Execute Vault Mint Via DsProxy ", async () => {
      const { decimals, balanceOf, allowance } = stubTokenInstance.methods;

      console.log("Balance : ", await balanceOf(user).call());
      console.log("Allowance : ", await allowance(user, vaultAddress).call());
      console.log("Vault Balance : ", await balanceOf(vaultAddress).call());

      const tokenDecimals = await decimals().call();
      const amount = new BigNumber(7);

      //const params = [vaultAddress, collateralAddress, amount.toString()];
      const params = [vaultAddress, blackToken.address, amount.toString()];

      const functionSig = web3.eth.abi.encodeFunctionSignature(
        "callMint(address,address,uint256)"
      );
      const functionData = web3.eth.abi.encodeParameters(
        ["address", "address", "uint256"],
        params
      );

      const argumentData = functionData.substring(2);
      const inputData = `${functionSig}${argumentData}`;

      console.log("Input Data : ", inputData);

      const response = await userProxyInstance.methods[
        "execute(address,bytes)"
      ].call(callActionsInstance.address, inputData, {
        from: user,
        ...gasParams,
      });

      console.log("response :", response);

      const tx = await userProxyInstance.methods[
        "execute(address,bytes)"
      ](callActionsInstance.address, inputData, { from: user, ...gasParams });

      console.log("- Tx - ");
      console.log(tx.logs);

      console.log(
        "Black Token Allowance : ",
        new BigNumber(
          await blackToken.allowance(user, vaultAddress)
        ).toNumber(),
        new BigNumber(
          await blackToken.allowance(user, userProxyAddress)
        ).toNumber()
      );

      assert.equal(true, true);
    });
  });
});