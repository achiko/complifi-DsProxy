require("dotenv").config();
const BigNumber = require("bignumber.js");
const DSProxyFactory = artifacts.require("DSProxyFactory");
const DSProxy = artifacts.require("DSProxy");
const CallActions = artifacts.require("CallActions");
const { snapshot, revert } = require("./utils");
const { gasParams, stubTokenAbi } = require("./config");

contract("CallActions", async (accounts) => {
  const vaultAddress = process.env.VAULT_CONTRACT;
  const collateralAddress = process.env.STUB_CONTRACT;
  console.log("Vault Contract : ", vaultAddress);
  console.log("Collateral STub token contract : ", collateralAddress);
  const user = accounts[2];

  describe("DSProxy", () => {
    let stubTokenInstance;
    // let vaultInstance;
    let callActionsInstance;
    let proxyFactory;
    let userProxyAddress;
    let userProxyInstance;
    let snapshotId;

    before(async () => {
      stubTokenInstance = new web3.eth.Contract(
        stubTokenAbi,
        collateralAddress
      );
      // vaultInstance = new web3.eth.Contract(vaultAbi, vaultAddress);
      callActionsInstance = await CallActions.deployed();
      proxyFactory = await DSProxyFactory.deployed();
      userProxyAddress = await proxyFactory.build.call({ from: user }); // Get proxy address
      await proxyFactory.build({ from: user }); // Build proxy
      userProxyInstance = await DSProxy.at(userProxyAddress);
    });

    beforeEach(async () => {
      snapshotId = (await snapshot()).result;
    });

    afterEach(async () => {
      await revert(snapshotId);
    });

    it.skip("... Mint Tokens Via DsProxy ", async () => {
      const { balanceOf, allowance, approve } = stubTokenInstance.methods;

      console.log("User Accounts[2] Balance : ", await balanceOf(user).call());

      const amount = new BigNumber(10);
      await approve(userProxyAddress, amount).send({ from: user });

      const dsProxyAllowance = await allowance(user, userProxyAddress).call();
      console.log("Ds-Proxy Allowance : ", dsProxyAllowance);
      assert.notEqual(dsProxyAllowance, 0);

      const params = [vaultAddress, collateralAddress, amount.toString()];
      const functionSig = web3.eth.abi.encodeFunctionSignature(
        "callMint(address,address,uint256)"
      );
      const functionData = web3.eth.abi.encodeParameters(
        ["address", "address", "uint256"],
        params
      );

      const argumentData = functionData.substring(2);
      const inputData = `${functionSig}${argumentData}`;

      const tx = await userProxyInstance.methods[
        "execute(address,bytes)"
      ](callActionsInstance.address, inputData, { from: user, ...gasParams });

      console.log("- Tx - ");
      console.log(tx.receipt.logs);

      assert.equal(tx.receipt.status, true);
    });

    it("... Mint Tokens Via DsProxy for User1 Accounts[3] ", async () => {
      const {
        balanceOf,
        allowance,
        approve,
        transfer,
      } = stubTokenInstance.methods;

      const user1 = accounts[3];
      const collateralAmount = new BigNumber(50);
      console.log("User1 Balance : ", await balanceOf(user1).call());
      assert.equal(await balanceOf(user1).call(), 0);
      await transfer(user1, collateralAmount).send({ from: user });
      const tokenBalance = new BigNumber(await balanceOf(user1).call());
      console.log("Token Balance for User1 ", tokenBalance.toFixed());
      assert.isTrue(tokenBalance.isEqualTo(collateralAmount));

      const user1ProxyAddress = await proxyFactory.build.call({ from: user1 });
      await proxyFactory.build({ from: user });
      const user1ProxyInstance = await DSProxy.at(user1ProxyAddress);

      await approve(user1ProxyAddress, collateralAmount).send({ from: user1 });
      console.log(
        "Allowance : ",
        await allowance(user1, user1ProxyAddress).call()
      );

      assert.isTrue(
        new BigNumber(
          await allowance(user1, userProxyAddress).call()
        ).isEqualTo(collateralAmount)
      );

      const params = [
        vaultAddress,
        collateralAddress,
        collateralAmount.toString(),
      ];
      const functionSig = web3.eth.abi.encodeFunctionSignature(
        "callMint(address,address,uint256)"
      );
      const functionData = web3.eth.abi.encodeParameters(
        ["address", "address", "uint256"],
        params
      );

      const argumentData = functionData.substring(2);
      const inputData = `${functionSig}${argumentData}`;

      const tx = await user1ProxyInstance.methods[
        "execute(address,bytes)"
      ](callActionsInstance.address, inputData, { from: user, ...gasParams });

      console.log("- Tx - ");
      console.log(tx);

      assert.equal(tx.receipt.status, true);
    });
  });
});
