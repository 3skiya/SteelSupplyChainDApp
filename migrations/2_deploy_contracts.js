var Migrations = artifacts.require("./base/SupplyChain.sol");

module.exports = function(deployer) {
    deployer.deploy(Migrations);
};
