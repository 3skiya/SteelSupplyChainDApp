const HDWalletProvider = require('truffle-hdwallet-provider');
const fs = require('fs');

//set mnemonic in .secret file
const mnemonic = fs.readFileSync(".secret").toString().trim();

module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 7545,
      network_id: "*", // Match any network id
      gas: 5000000
    },
    rinkeby: {
              provider: () => new HDWalletProvider(mnemonic, `https://rinkeby.infura.io/v3/787fd4f855d54a26af727f9dacc90312`),
              network_id: '4'
          },
  },

  compilers: {
    solc: {
      settings: {
        optimizer: {
          enabled: true, // Default: false
          runs: 200      // Default: 200
        },
      }
    }
  }
};
