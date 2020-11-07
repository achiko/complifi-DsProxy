const DSProxyFactory = artifacts.require("DSProxyFactory");
const CallActions = artifacts.require("CallActions");
const Helper = artifacts.require("Helper");

module.exports = async function (deployer, network, accounts) {
  await deployer.deploy(Helper);
  await deployer.deploy(CallActions);
  console.log("CallActions Address : ", CallActions.address);
  await deployer.deploy(DSProxyFactory);
  console.log("DsProxy Factory Address : ", DSProxyFactory.address);
};
