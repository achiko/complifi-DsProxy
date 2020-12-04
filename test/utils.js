const snapshot = () =>
  new Promise((resolve, reject) => {
    web3.currentProvider.send(
      { jsonrpc: "2.0", method: "evm_snapshot", params: [], id: 0 },
      function (error, result) {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
  });

const revert = (id) =>
  new Promise((resolve, reject) => {
    web3.currentProvider.send(
      { jsonrpc: "2.0", method: "evm_revert", params: [id], id: 0 },
      function (error, result) {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
  });

module.exports = {
  revert,
  snapshot,
};
