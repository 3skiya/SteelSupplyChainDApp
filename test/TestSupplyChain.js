var SupplyChain = artifacts.require('SupplyChain');
const truffleAssert = require('truffle-assertions');

contract('SupplyChain', function(accounts) {
    //Declare constants and assign sample accounts
    var sku = 1;
    var upc = 1;
    var steelBatchID = 1;
    const ownerID = accounts[0];
    const steelMakerID = accounts[1];
    const partProducerID = accounts[2];
    const distributorID = accounts[3];
    const retailerID = accounts[4];
    const consumerID = accounts[5];

    //Set up fake mill
    const steelMill = "Pitsburgh Steel Mill";
    const steelMillInformation = "This is a fake steel mill";
    const steelMillLatitude = "40.4406";
    const steelMillLongitude = "79.9959";
    const steelMillNotes = "fake steel 41C batch";
    const steelPrice = web3.utils.toWei("1", "ether");

    //set up fake part producer
    const producerName = "Rick's Job Shop";
   const producerInformation = "Fake machining work done here";
   const producerLatitude = "40.7128";
   const producerLongitude = "74.0060";
   var partID = sku + upc;
   const partNotes = "Fake machined parts from steel";
   const partPrice = web3.utils.toWei("2", "ether");
   const partPriceRetail = web3.utils.toWei("3", "ether");

   //set steel and Part state
   var steelState = 0;
   var partState = 0;

   //set an emptyAddress
   const emptyAddress = '0x0000000000000000000000000000000000000000';

   //console.log the addresses in use
   console.log("ganache-cli accounts used here...");
    console.log("Contract Owner: accounts[0] ", accounts[0]);
    console.log("steelMaker: accounts[1] ", accounts[1]);
    console.log("partProducer: accounts[2] ", accounts[2]);
    console.log("Distributor: accounts[3] ", accounts[3]);
    console.log("Retailer: accounts[4] ", accounts[4]);
    console.log("Consumer: accounts[5] ", accounts[5]);

    //1st Test
    it("tests castSteel() that lets a steelMaker cast steel", async() => {
        const supplyChain = await SupplyChain.deployed();
        //add a new steelMaker
        await supplyChain.addSteelMaker(steelMakerID);
        //Mark steel as casted by using castSteel()
        var result = await supplyChain.castSteel(steelBatchID, steelMill, steelMillInformation, steelMillLatitude, steelMillLongitude, steelMillNotes, {from: steelMakerID});
        //retreive the steel batches
        const steelResult = await supplyChain.fetchSteelBatch.call(steelBatchID);
        assert.equal(steelResult[0], steelBatchID, 'Error: invalid steelBatchID');
        assert.equal(steelResult[1], steelMakerID, 'Error: steelMaker is not the owner of the steel');
        assert.equal(steelResult[2], steelMakerID, 'Error: invalid steelMakerID');
        assert.equal(steelResult[3], steelMill, 'Error: invalid steelMill name');
        assert.equal(steelResult[4], steelMillInformation, 'Error: Missing or Invalid steelMillInformation');
        assert.equal(steelResult[5], steelMillLatitude, 'Error: Missing or Invalid steelMillLatitude');
        assert.equal(steelResult[6], steelMillLongitude, 'Error: Missing or Invalid steelMillLongitude');
        assert.equal(steelResult[9], steelState, 'Error: Invalid steel State ');
        assert.equal(steelResult[7], steelMillNotes, 'Error: Missing or Invalid steelMillNotes ');
        truffleAssert.eventEmitted(result, 'SteelBatchCasted', (ev) => {
            return parseInt(ev.steelBatchID) === steelBatchID;
        });
    });

    //2nd Test
    it("tests sellSteelBatch() that allows steelMakers to put steelBatches for sale", async() => {
        const supplyChain = await SupplyChain.deployed();
        //Mark steel as for sale by using steelBatchForSale()
        var result = await supplyChain.sellSteelBatch(steelBatchID, steelPrice, {from: steelMakerID});
        //retreive the steelBatch
        const steelResult = await supplyChain.fetchSteelBatch.call(steelBatchID);
        assert.equal(steelResult[8], steelPrice, 'Error: invalid steel price');
        assert.equal(steelResult[9], 1, 'Error:steel state is not ForSale');
        truffleAssert.eventEmitted(result, 'SteelBatchForSale', (ev) => {
            return parseInt(ev.steelBatchID) === steelBatchID;
        });
    });

    //3rd Test
    it("tests buySteelBatch() that allows partProducers to buy steelBatches", async() => {
        const supplyChain = await SupplyChain.deployed();
        //get account balances
        var steelMakerInitialBalance = await web3.eth.getBalance(steelMakerID);
        //create a partProducer
        await supplyChain.addPartProducer(partProducerID);
        //Mark steel as steelBatchSold
        var result = await supplyChain.buySteelBatch(steelBatchID, {from: partProducerID, value: steelPrice});
        //retrieve the steelBatch
        const steelResult = await supplyChain.fetchSteelBatch.call(steelBatchID);
        //Verify results
        assert.equal(steelResult[1], partProducerID, "Part Producer is not the owner of this steel");
        assert.equal(steelResult[9], 2, "SteelState is not Sold");
        //check account balances
        var steelMakerFinalBalance = await web3.eth.getBalance(steelMakerID);
        //Verify balance results
        var expectedBalance = parseInt(steelMakerInitialBalance) + parseInt(steelPrice);
        assert.equal(parseInt(steelMakerFinalBalance), expectedBalance, 'Error: steelMaker balance is invalid');
        truffleAssert.eventEmitted(result, 'SteelBatchSold', (ev) => {
            return parseInt(ev.steelBatchID) === steelBatchID;
        });
    });

    //4th Test
    it("tests shipSteelBatch() that allows a steelMaker to ship steel", async() => {
        const supplyChain = await SupplyChain.deployed();
        //Mark steel as shipped by using shipSteelBatch()
        var result = await supplyChain.shipSteelBatch(steelBatchID, {from: steelMakerID});
        //Verify results
        const steelResult = await supplyChain.fetchSteelBatch(steelBatchID);
        assert.equal(steelResult[9], 3, "SteelSate is not Shipped");
        truffleAssert.eventEmitted(result, 'SteelBatchShipped', (ev) => {
            return parseInt(ev.steelBatchID) === steelBatchID;
        });
    });

    //5th Test
    it("tests receiveSteelBatch() that allows a partProducer to receive steel", async() => {
        const supplyChain = await SupplyChain.deployed();
        //Mark steel as received by using receiveSteelBatch()
        var result = await supplyChain.receiveSteelBatch(steelBatchID, {from: partProducerID});
        //Verify results
        const steelResult = await supplyChain.fetchSteelBatch(steelBatchID);
        assert.equal(steelResult[9], 4, "SteelSate is not Received");
        truffleAssert.eventEmitted(result, 'SteelBatchReceived', (ev) => {
            return parseInt(ev.steelBatchID) === steelBatchID;
        });
    });

    //6th Test
    it("tests producePart() that allows partProducer to produce a part", async() => {
        const supplyChain = await SupplyChain.deployed();
        //Mark Part as Produced with producePart()
        var result = await supplyChain.producePart(upc, producerName, producerInformation, producerLatitude, producerLongitude, partNotes, {from: partProducerID});
        //verify results
        const partResultOne = await supplyChain.fetchPartOne.call(upc);
        assert.equal(partResultOne[0], sku, 'Error: invalid SKU');
        assert.equal(partResultOne[1], upc, 'Error: invalid UPC');
        assert.equal(partResultOne[2], partProducerID, 'Error: invalid ownerID');
        assert.equal(partResultOne[3], partProducerID, 'Error: invalid partProducerID');
        assert.equal(partResultOne[4], 0, 'Error: missing or invalid price');
        assert.equal(partResultOne[5], partState, 'Error: invalid part state');
        assert.equal(partResultOne[6], emptyAddress, 'Error: distributorID should be empty');
        assert.equal(partResultOne[7], emptyAddress, 'Error: retailerID should be empty');
        assert.equal(partResultOne[8], emptyAddress, 'Error: consumerID should be empty');
        truffleAssert.eventEmitted(result, 'PartProduced', (ev) => {
            return parseInt(ev.upc) === upc;
        });
    });

    //7th test
    it("tests packPart() that allows a partProducer to pack a part", async() => {
        const supplyChain = await SupplyChain.deployed();
        //mark Part as Packed with packPart()
        var result = await supplyChain.packPart(upc, {from: partProducerID});
        //Verify results
        const partResultOne = await supplyChain.fetchPartOne.call(upc);
        assert.equal(partResultOne[1], upc, 'Error: Invalid upc');
        assert.equal(partResultOne[5], 1, 'Error: invalid partState');
        truffleAssert.eventEmitted(result, 'PartPacked', (ev) => {
            return parseInt(ev.upc) === upc;
        });
    });

    //8th Test
    it("tests sellPart() that allows a partProducer to sell a part to distributor", async() => {
        const supplyChain = await SupplyChain.deployed();
        //mark Part as ForSale with sellPart()
        var result = await supplyChain.sellPart(upc, partPrice, {from: partProducerID});
        //Verify results
        const partResultOne = await supplyChain.fetchPartOne.call(upc);
        assert.equal(partResultOne[1], upc, 'Error: Invalid upc');
        assert.equal(partResultOne[4], partPrice, 'Error: Invalid part price');
        assert.equal(partResultOne[5], 2, 'Error: invalid partState');
        truffleAssert.eventEmitted(result, 'PartForSale', (ev) => {
            return parseInt(ev.upc) === upc;
        });
    });

    //9th Test
    it("tests buyPart() that allows a distributor to buy a part from a partProducer", async() =>{
        const supplyChain = await SupplyChain.deployed();
        //create a Distributor
        await supplyChain.addDistributor(distributorID);
        //mark Part as Sold with buyPart()
        var partProducerInitialBalance = await web3.eth.getBalance(partProducerID);
        var result = await supplyChain.buyPart(upc, {from: distributorID, value: partPrice});
        //verify the result
        const partResultOne = await supplyChain.fetchPartOne.call(upc);
        assert.equal(partResultOne[1], upc, 'Error: Invalid upc');
        assert.equal(partResultOne[3], partProducerID, 'error: missing or invalid partProducerID');
        assert.equal(partResultOne[5], 3, 'Error: invalid partState');
        //verify balances
        var partProducerFinalBalance = await web3.eth.getBalance(partProducerID);
        var expectedBalance = parseInt(partProducerInitialBalance) + parseInt(partPrice);
        assert.equal(parseInt(partProducerFinalBalance), expectedBalance, 'Error: partPrdoucer balance invalid');
        truffleAssert.eventEmitted(result, 'PartSold', (ev) => {
            return parseInt(ev.upc) === upc;
        });
    });

    //10th Test
    it('tests shipPart() that allows a partProducer to ship a part', async() => {
        const supplyChain = await SupplyChain.deployed();
        //mark Part as Shipped with shipPart()
        var result = await supplyChain.shipPart(upc, {from: partProducerID});
        //verify results
        const partResultOne = await supplyChain.fetchPartOne.call(upc);
        assert.equal(partResultOne[1], upc, 'Error: Invalid upc');
        assert.equal(partResultOne[5], 4, 'Error: invalid partState');
        truffleAssert.eventEmitted(result, 'PartShipped', (ev) => {
            return parseInt(ev.upc) === upc;
        });
    });

    //11th Test
    it('tests receivePart() that allows a retailer to receive a part', async() => {
        const supplyChain = await SupplyChain.deployed();
        //Add a retailer
        await supplyChain.addRetailer(retailerID);
        //mark Part as received with receivePart()
        var result = await supplyChain.receivePart(upc, partPriceRetail, {from: retailerID});
        //verify results
        const partResultOne = await supplyChain.fetchPartOne.call(upc);
        assert.equal(partResultOne[1], upc, 'Error: Invalid upc');
        assert.equal(partResultOne[2], retailerID, 'Error: retailer does not own this part');
        assert.equal(partResultOne[5], 5, 'Error: invalid partState');
        truffleAssert.eventEmitted(result, 'PartReceived', (ev) => {
            return parseInt(ev.upc) === upc;
        });
    });

    //12th Test
    it('tests purchasePart() that allows a consumer to purchase a part', async() => {
        const supplyChain = await SupplyChain.deployed();
        //add a retailer
        await supplyChain.addConsumer(consumerID);
        //get account balances
        var retailerInitialBalance = await web3.eth.getBalance(retailerID);
        var result = await supplyChain.purchasePart(upc, {from: consumerID, value: partPriceRetail});
        //verify the results
        const partResultOne = await supplyChain.fetchPartOne.call(upc);
        assert.equal(partResultOne[1], upc, 'Error: Invalid upc');
        assert.equal(partResultOne[2], consumerID, 'Error: consumer does not own this part');
        assert.equal(partResultOne[5], 6, 'Error: invalid partState');
        //verify balances
        var retailerFinalBalance = await web3.eth.getBalance(retailerID);
        var expectedBalance = parseInt(retailerInitialBalance) + parseInt(partPriceRetail);
        assert.equal(parseInt(retailerFinalBalance), expectedBalance, 'Error: retailer balance is invalid');
        truffleAssert.eventEmitted(result, 'PartPurchased', (ev) => {
            return parseInt(ev.upc) === upc;
        });
    });
});
