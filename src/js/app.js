App = {
    web3Provider: null,
    contracts: {},
    emptyAddress: "0x0000000000000000000000000000000000000000",
    sku: 0,
    upc: 0,

    metamaskAccountID: "0x0000000000000000000000000000000000000000",
    addressID: "0x0000000000000000000000000000000000000000",
    roleType: null,
    //steel
    steelBatchOwnerID: "0x0000000000000000000000000000000000000000",
    steelBatchID: 0,
    steelMakerID: "0x0000000000000000000000000000000000000000",
    steelMill: null,
    steelMillInformation: null,
    steelMillLatitude: null,
    steelMillLongitude: null,
    steelMillNotes: null,
    steelPrice: 0,
    //parts
    partPrice: 0,
    partProducerID: "0x0000000000000000000000000000000000000000",
    distributorID: "0x0000000000000000000000000000000000000000",
    retailerID: "0x0000000000000000000000000000000000000000",
    consumerID: "0x0000000000000000000000000000000000000000",
    partOwnerID: "0x0000000000000000000000000000000000000000",
    partProducerName: null,
    producerInformation: null,
    producerLatitude: null,
    producerLongitude: null,
    partInformation: null,
    partID: null,

    init: async function () {
        App.readForm();
        /// Setup access to blockchain
        return await App.initWeb3();
    },

    readForm: function () {
        App.sku = $("#sku").val();
        App.upc = $("#upc").val();
        App.addressID = $("#addressID").val();
        App.roleType = $("#roleType").val();
        App.steelBatchOwnerID = $("#steelBatchOwnerID").val();
        App.steelBatchID = $("#steelBatchID").val();
        App.steelMakerID = $("#steelMakerID").val();
        App.steelMill = $("#steelMill").val();
        App.steelMillInformation = $("#steelMillInformation").val();
        App.steelMillLatitude = $("#steelMillLatitude").val();
        App.steelMillLongitude = $("#steelMillLongitude").val();
        App.steelMillNotes = $("#steelMillNotes").val();
        App.steelPrice = $("#steelPrice").val();
        App.partOwnerID = $("#partOwnerID").val();
        App.producerName = $("#producerName").val();
        App.producerInformation = $("#producerInformation").val();
        App.producerLatitude = $("#producerLatitude").val();
        App.producerLongitude = $("#producerLongitude").val();
        App.productPrice = $("#productPrice").val();
        App.partNotes = $("#partNotes").val();
        App.distributorID = $("#distributorID").val();
        App.retailerID = $("#retailerID").val();
        App.consumerID = $("#consumerID").val();

        console.log(
            App.sku,
            App.upc,
            App.addressID,
            App.roleType,
            App.steelBatchOwnerID,
            App.steelMakerID,
            App.steelMill,
            App.steelMillInformation,
            App.steelMillLatitude,
            App.steelMillLongitude,
            App.steelMillNotes,
            App.partOwnerID,
            App.partProducerName,
            App.producerInformation,
            App.producerLatitude,
            App.producerLongitude,
            App.productPrice,
            App.productNotes,
            App.distributorID,
            App.retailerID,
            App.consumerID
        );
    },

    initWeb3: async function () {
        /// Find or Inject Web3 Provider
        /// Modern dapp browsers...
        if (window.ethereum) {
            App.web3Provider = window.ethereum;
            try {
                // Request account access
                await window.ethereum.enable();
            } catch (error) {
                // User denied account access...
                console.error("User denied account access")
            }
        }
        // Legacy dapp browsers...
        else if (window.web3) {
            App.web3Provider = window.web3.currentProvider;
        }
        // If no injected web3 instance is detected, fall back to Ganache
        else {
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
        }

        App.getMetaskAccountID();

        return App.initSupplyChain();
    },

    getMetaskAccountID: function () {
        web3 = new Web3(App.web3Provider);

        // Retrieving accounts
        web3.eth.getAccounts(function(err, res) {
            if (err) {
                console.log('Error:',err);
                return;
            }
            console.log('getMetaskID:',res);
            App.metamaskAccountID = res[0];

        })
    },

    initSupplyChain: function () {
        /// Source the truffle compiled smart contracts
        var jsonSupplyChain='../../build/contracts/SupplyChain.json';

        /// JSONfy the smart contracts
        $.getJSON(jsonSupplyChain, function(data) {
            console.log('data',data);
            var SupplyChainArtifact = data;
            App.contracts.SupplyChain = TruffleContract(SupplyChainArtifact);
            App.contracts.SupplyChain.setProvider(App.web3Provider);
            web3.eth.defaultAccount = web3.eth.accounts[0];

            App.fetchSteelBatch();
            App.fetchPartOne();
            App.fetchPartTwo();
            App.fetchEvents();

        });

        return App.bindEvents();
    },

    bindEvents: function() {
        $(document).on('click', App.handleButtonClick);
    },

    handleButtonClick: async function(event) {
        event.preventDefault();

        App.getMetaskAccountID();

        var processId = parseInt($(event.target).data('id'));
        console.log('processId',processId);

        switch(processId) {
            case 1:
                return await App.castSteel(event);
                break;
            case 2:
                return await App.sellSteelBatch(event);
                break;
            case 3:
                return await App.buySteelBatch(event);
                break;
            case 4:
                return await App.shipSteelBatch(event);
                break;
            case 5:
                return await App.receiveSteelBatch(event);
                break;
            case 6:
                return await App.fetchSteelBatch(event);
                break;
            case 7:
                return await App.producePart(event);
                break;
            case 8:
                return await App.packPart(event);
                break;
            case 9:
                return await App.sellPart(event);
                break;
            case 10:
                return await App.buyPart(event);
                break;
            case 11:
                return await App.shipPart(event);
                break;
            case 12:
                return await App.receivePart(event);
                break;
            case 13:
                return await App.purchasePart(event);
                break;
            case 14:
                return await App.fetchPartOne(event);
                break;
            case 15:
                return await App.fetchPartTwo(event);
                break;
            }
    },

    castSteel: function(event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));

        App.contracts.SupplyChain.deployed().then(function(instance) {
            return instance.castSteel(
                App.steelBatchID,
                App.steelMill,
                App.steelMillInformation,
                App.steelMillLatitude,
                App.steelMillLongitude,
                App.steelMillNotes,
                {from: App.metamaskAccountID}
            );
        }).then(function(result) {
            $("#ftc-item").text(result);
            console.log('castSteel',result);
        }).catch(function(err) {
            console.log(err.message);
        });
    },

    sellSteelBatch: function (event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));

        App.contracts.SupplyChain.deployed().then(function(instance) {
            const _steelPrice = web3.toWei(App.steelPrice, "ether");
            return instance.sellSteelBatch(App.steelBatchID, _steelPrice, {from: App.metamaskAccountID});
        }).then(function(result) {
            $("#ftc-item").text(result);
            console.log('Sell Steel Batch',result);
        }).catch(function(err) {
            console.log(err.message);
        });
    },

    buySteelBatch: function (event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));

        App.contracts.SupplyChain.deployed().then(function(instance) {
            const value = web3.toWei(App.steelPrice, "ether");
            return instance.buySteelBatch(App.steelBatchID, {from: App.metamaskAccountID, value: value});
        }).then(function(result) {
            $("#ftc-item").text(result);
            console.log('buySteelBatch',result);
        }).catch(function(err) {
            console.log(err.message);
        });
    },


    shipSteelBatch: function (event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));

        App.contracts.SupplyChain.deployed().then(function(instance) {
            return instance.shipSteelBatch(App.steelBatchID, {from: App.metamaskAccountID});
        }).then(function(result) {
            $("#ftc-item").text(result);
            console.log('shipSteelBatch',result);
        }).catch(function(err) {
            console.log(err.message);
        });
    },

    receiveSteelBatch: function (event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));

        App.contracts.SupplyChain.deployed().then(function(instance) {
            return instance.receiveSteelBatch(App.steelBatchID, {from: App.metamaskAccountID});
        }).then(function(result) {
            $("#ftc-item").text(result);
            console.log('receiveSteelBatch',result);
        }).catch(function(err) {
            console.log(err.message);
        });
    },

    fetchSteelBatch: function () {
    ///   event.preventDefault();
    ///    var processId = parseInt($(event.target).data('id'));
        App.steelBatchID = $('#steelBatchID').val();
        console.log('steelBatchID',App.steelBatchID);

        App.contracts.SupplyChain.deployed().then(function(instance) {
          return instance.fetchSteelBatch(App.steelBatchID);
        }).then(function(result) {
          $("#ftc-item").text(result);
          console.log('fetchSteelBatch', result);
        }).catch(function(err) {
          console.log(err.message);
        });
    },

    producePart: function(event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));

        App.contracts.SupplyChain.deployed().then(function(instance) {
            return instance.producePart(
                App.upc,
                App.producerName,
                App.producerInformation,
                App.producerLatitude,
                App.producerLongitude,
                App.partNotes,
                {from: App.metamaskAccountID}
            );
        }).then(function(result) {
            $("#ftc-item").text(result);
            console.log('producePart',result);
        }).catch(function(err) {
            console.log(err.message);
        });
    },

    packPart: function (event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));

        App.contracts.SupplyChain.deployed().then(function(instance) {
            return instance.packPart(App.upc, {from: App.metamaskAccountID});
        }).then(function(result) {
            $("#ftc-item").text(result);
            console.log('packPart',result);
        }).catch(function(err) {
            console.log(err.message);
        });
    },

    sellPart: function (event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));

        App.contracts.SupplyChain.deployed().then(function(instance) {
            const _partPrice = web3.toWei(1, "ether");
            console.log('partPrice',_partPrice);
            return instance.sellPart(App.upc, App.partPrice, {from: App.metamaskAccountID});
        }).then(function(result) {
            $("#ftc-item").text(result);
            console.log('sellItem',result);
        }).catch(function(err) {
            console.log(err.message);
        });
    },

    buyPart: function (event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));

        App.contracts.SupplyChain.deployed().then(function(instance) {
            const value = web3.toWei(App.partPrice, "ether");
            return instance.buyPart(App.upc, {from: App.metamaskAccountID, value: value});
        }).then(function(result) {
            $("#ftc-item").text(result);
            console.log('buyPart',result);
        }).catch(function(err) {
            console.log(err.message);
        });
    },

    shipPart: function (event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));

        App.contracts.SupplyChain.deployed().then(function(instance) {
            return instance.shipPart(App.upc, {from: App.metamaskAccountID});
        }).then(function(result) {
            $("#ftc-item").text(result);
            console.log('shipPart',result);
        }).catch(function(err) {
            console.log(err.message);
        });
    },

    receivePart: function (event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));

        App.contracts.SupplyChain.deployed().then(function(instance) {
            const _partPrice = web3.toWei(App.partPrice, "ether");
            return instance.receivePart(App.upc, _partPrice, {from: App.metamaskAccountID});
        }).then(function(result) {
            $("#ftc-item").text(result);
            console.log('receivePart',result);
        }).catch(function(err) {
            console.log(err.message);
        });
    },

    purchasePart: function (event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));

        App.contracts.SupplyChain.deployed().then(function(instance) {
            return instance.purchasePart(App.upc, {from: App.metamaskAccountID});
        }).then(function(result) {
            $("#ftc-item").text(result);
            console.log('purchaseItem',result);
        }).catch(function(err) {
            console.log(err.message);
        });
    },

    fetchPartOne: function () {
    ///    event.preventDefault();
    ///    var processId = parseInt($(event.target).data('id'));

        App.contracts.SupplyChain.deployed().then(function(instance) {
          return instance.fetchPartOne.call(App.upc);
        }).then(function(result) {
          $("#ftc-item").text(result);
          console.log('fetchPartOne', result);
        }).catch(function(err) {
          console.log(err.message);
        });
    },

    fetchPartTwo: function () {
    ///    event.preventDefault();
    ///    var processId = parseInt($(event.target).data('id'));

        App.contracts.SupplyChain.deployed().then(function(instance) {
          return instance.fetchPartTwo.call(App.upc);
        }).then(function(result) {
          $("#ftc-item").text(result);
          console.log('fetchPartTwo', result);
        }).catch(function(err) {
          console.log(err.message);
        });
    },

    fetchEvents: function () {
        if (typeof App.contracts.SupplyChain.currentProvider.sendAsync !== "function") {
            App.contracts.SupplyChain.currentProvider.sendAsync = function () {
                return App.contracts.SupplyChain.currentProvider.send.apply(
                App.contracts.SupplyChain.currentProvider,
                    arguments
              );
            };
        }

        App.contracts.SupplyChain.deployed().then(function(instance) {
        var events = instance.allEvents(function(err, log){
          if (!err)
            $("#ftc-events").append('<li>' + log.event + ' - ' + log.transactionHash + '</li>');
        });
        }).catch(function(err) {
          console.log(err.message);
        });

    }
};

$(function () {
    $(window).load(function () {
        App.init();
    });
});
