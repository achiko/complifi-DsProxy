require("dotenv").config();
const BigNumber = require("bignumber.js");
const DSProxyFactory = artifacts.require("DSProxyFactory");
const DSProxy = artifacts.require("DSProxy");
const CallActions = artifacts.require("CallActions");
const { snapshot, revert } = require("./utils");
const { gasParams, stubTokenAbi, vaultAbi, erc20Abi, derivativesSpecificationsAbi } = require("./config");

contract("CallActions", async (accounts) => {
  const vaultAddress = process.env.VAULT_CONTRACT;
  const collateralAddress = process.env.STUB_CONTRACT;
  console.log("Vault Contract : ", vaultAddress);
  console.log("Collateral STub token contract : ", collateralAddress);
  const user = accounts[2];

  describe("DSProxy", () => {
    let stubTokenInstance;
    let vaultInstance;
    let callActionsInstance;
    let proxyFactory;
    let userProxyAddress;
    let userProxyInstance;
    let snapshotId;
    let primaryTokenInstance;
    let complementTokenInstance;
    // let derivativeSpecificationInstance;

    before(async () => {
      stubTokenInstance = new web3.eth.Contract(
        stubTokenAbi,
        collateralAddress
      );

      console.log(".................................................");
      // console.log("::::::::: Vault Instance ::::::::::");
      vaultInstance = new web3.eth.Contract(vaultAbi, vaultAddress);
      const { primaryToken, complementToken } = vaultInstance.methods;

      const primaryTokenAddress = await primaryToken().call();
      const complementTokenAddress = await complementToken().call();

      primaryTokenInstance = new web3.eth.Contract(
        erc20Abi,
        primaryTokenAddress
      );
      complementTokenInstance = new web3.eth.Contract(
        erc20Abi,
        complementTokenAddress
      );
      console.log("primaryTokenAddress : ", primaryTokenAddress);
      console.log("complementTokenAddress : ", complementTokenAddress);

      const {
        name: primaryTokenName,
        symbol: primaryTokenSymbol,
      } = primaryTokenInstance.methods;
      const {
        name: complementTokenName,
        symbol: complementTokenSymbol,
      } = complementTokenInstance.methods;

      console.log(
        "Primary Token : ",
        await primaryTokenName().call(),
        await primaryTokenSymbol().call()
      );
      console.log(
        "Complement Token : ",
        await complementTokenName().call(),
        await complementTokenSymbol().call()
      );

      const _derivativeSpecification = await vaultInstance.methods.derivativeSpecification().call();
      console.log("Derivative Specification :  ", _derivativeSpecification);
      // derivativeSpecificationInstance = new web3.eth.Contract(derivativesSpecificationsAbi, _derivativeSpecification)

      console.log(".................................................");

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

    const encodeData = (types, params, functionName) => {
      const functionSig = web3.eth.abi.encodeFunctionSignature(functionName);
      const functionData = web3.eth.abi.encodeParameters(types, params);
      const argumentData = functionData.substring(2);
      return `${functionSig}${argumentData}`;;
    };

    it("... Mint Tokens", async () => {
      const { balanceOf, allowance, approve } = stubTokenInstance.methods;
      const stubTokenBalance = await balanceOf(user).call();
      console.log("User Accounts[2] Balance : ", stubTokenBalance);
      await approve(userProxyAddress, stubTokenBalance).send({ from: user });

      const amount = new BigNumber(50);
      const dsProxyAllowance = await allowance(user, userProxyAddress).call();
      console.log("dsProxyAllowance", dsProxyAllowance);
      assert.notEqual(dsProxyAllowance, 0);

      const types = ["address", "address", "uint256"];
      const params = [vaultAddress, collateralAddress, amount.toString()];
      const functionName = "callMint(address,address,uint256)";
      const inputData = encodeData(types, params, functionName);

      const tx = await userProxyInstance.methods[
        "execute(address,bytes)"
      ](callActionsInstance.address, inputData, { from: user, ...gasParams });

      assert.equal(tx.receipt.status, true);
      assert.equal(await balanceOf(user).call(), stubTokenBalance - amount);

      const primaryTokenBalance = await primaryTokenInstance.methods
        .balanceOf(user)
        .call();
      const complementTokenBalance = await primaryTokenInstance.methods
        .balanceOf(user)
        .call();

      const protocolFee = await vaultInstance.methods.protocolFee().call();
      console.log("Protocol Fee :  ", protocolFee);

      console.log("user PrimaryTokenBalance :  ", primaryTokenBalance);
      console.log("user ComplementTokenBalance :  ", complementTokenBalance);
      // console.log("Author Fee : ", await derivativeSpecificationInstance.methods.authorFee().call());

      // await approve(userProxyAddress, primaryTokenBalance).send({ from: user });

      // TODO: Discuss this scenario ...
      await primaryTokenInstance.methods
        .approve(userProxyAddress, primaryTokenBalance)
        .send({ from: user });
      await complementTokenInstance.methods
        .approve(userProxyAddress, complementTokenBalance)
        .send({ from: user });

      // Refund
      const refundTokensAmount = new BigNumber(10);
      const refundInputData = encodeData(
        ["uint256", "address"],
        [refundTokensAmount, vaultAddress],
        "callRefund(uint256,address)"
      );

      await userProxyInstance.methods[
        "execute(address,bytes)"
      ](callActionsInstance.address, refundInputData, {
        from: user,
        ...gasParams,
      });

      console.log("PrimaryToken balance :  After Refund ", await primaryTokenInstance.methods.balanceOf(user).call());
      console.log("ComplementToken balance :  After Refund ", await complementTokenInstance.methods.balanceOf(user).call());

      assert.equal(await primaryTokenInstance.methods.balanceOf(user).call(), primaryTokenBalance - refundTokensAmount);
      assert.equal(await complementTokenInstance.methods.balanceOf(user).call(), complementTokenBalance - refundTokensAmount);
      // console.log(txRefund);
    });

    it("... Mint Tokens for User1 Accounts[3] ", async () => {
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
      await proxyFactory.build({ from: user1 });
      const user1ProxyInstance = await DSProxy.at(user1ProxyAddress);

      await approve(user1ProxyAddress, collateralAmount).send({ from: user1 });
      console.log(
        "Allowance : ",
        await allowance(user1, user1ProxyAddress).call()
      );

      assert.isTrue(
        new BigNumber(
          await allowance(user1, user1ProxyAddress).call()
        ).isEqualTo(collateralAmount)
      );

      // TODO: This is a duplicate code (must be refactored)
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
      ](callActionsInstance.address, inputData, { from: user1, ...gasParams });

      // console.log("- Tx - ");
      // console.log(tx);

      assert.equal(tx.receipt.status, true);

      const primaryTokenBalance = await primaryTokenInstance.methods
        .balanceOf(user1)
        .call();
      const complementTokenBalance = await primaryTokenInstance.methods
        .balanceOf(user1)
        .call();
      console.log("user1 PrimaryTokenBalance :  ", primaryTokenBalance);
      console.log("user1 ComplementTokenBalance :  ", complementTokenBalance);

      // TODO : need to check Author fee calulcation
      assert.equal(primaryTokenBalance, collateralAmount.div(2));
      assert.equal(complementTokenBalance, collateralAmount.div(2));
    });
  });
});
