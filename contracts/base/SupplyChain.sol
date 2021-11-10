pragma solidity >= 0.5.0;
//import access control for use within SupplyChain.sol
import "../accesscontrol/ConsumerRole.sol";
import "../accesscontrol/DistributorRole.sol";
import "../accesscontrol/PartProducerRole.sol";
import "../accesscontrol/RetailerRole.sol";
import "../accesscontrol/Roles.sol";
import "../accesscontrol/SteelMakerRole.sol";
import "../core/Ownable.sol";

//conract defining

contract SupplyChain is
    ConsumerRole,
    DistributorRole,
    PartProducerRole,
    RetailerRole,
    SteelMakerRole,
    Ownable {

    //Define a variable called 'upc' for Universal Product Code
    uint upc;

    //Define a variable called 'sku' for Stock Keeping Unit
    uint sku;

    //Define a variable 'SteelBatchID' for identifying steel batches
    uint steelBatchID;

    //define public mapping 'steel' that maps SteelBatchID to the part it makes
    mapping (uint => SteelBatch) steel;

    //define a public mapping of 'steelHistory' that maps the SteelBatchID to an array of TxHash,
    //that track its journey through the supply chain -- to be sent from DApp.
    mapping (uint => string[]) steelHistory;

    //define public mapping 'items' that maps UPC to a part
    mapping (uint => Part) items;

    // Define a public mapping 'itemsHistory' that maps the UPC to an array of TxHash,
    // that track its journey through the supply chain -- to be sent from DApp.
    mapping (uint => string[]) itemsHistory;

    //define enum 'SteelState' to track the following values:
    enum SteelState {
        Casted,   //0
        ForSale, //1
        Sold,    //2
        Shipped, //3
        Received //4
    }

    //define enum 'PartState' to track the following values:
    enum PartState {
        Produced,    //0
        Packed,     // 1
        ForSale,    // 2
        Sold,       // 3
        Shipped,    // 4
        Received,   // 5
        Purchased   // 6
    }

    //define default states for 'SteelState' and 'PartState'
    SteelState constant defaultSteelState = SteelState.Casted;
    PartState constant defaultPartState = PartState.Produced;

    //define struct 'SteelBatch'
    struct SteelBatch {
        uint steelBatchID; //unique Id for SteelBatchID
        address payable ownerID;  //Metamask-Ethereum address of the current owner as the product moves through different stages
        address payable steelMakerID;  //metamask-Ethereum address of the Steel Maker
        string steelMill;   //steel mill name
        string steelMillInformation;  //steel mill information
        string steelMillLatitude;   // Steel Mill latitude
        string steelMillLongitude;  // steel mill longitude
        string steelMillNotes;  //Steel mill notes
        uint steelPrice;  // steel Price
        SteelState steelState; //Steel State as represented in the enum 'SteelState'
        bool exist;
    }

    //Define a struct 'Part'
    struct Part {
        uint sku;  //Stock Keeping Unit (SKU)
        uint upc;  // Universal Product Code (UPC)
        address payable ownerID;  // Metamask - Ethereum address of the current owner as the product moves through different stages
        address payable partProducerID;   //metamask-Ethereum address of the Part Producer
        string producerName;   //Producer name
        string producerInformation;   //Producer information
        string producerLatitude;    //Producer latitude
        string producerLongitude;  //Producer Longitude
        uint partID;  //part ID potentially a combination of upc + SKU
        string partNotes;  //Part Notes
        uint partPrice;  //Part Price
        PartState partState; //Part State as represented in the enum 'PartState'
        address payable distributorID;  // Metamask-Ethereum address of the Distributor
        address payable retailerID; // Metamask-Ethereum address of the Retailer
        address payable consumerID; // Metamask-Ethereum address of the Consumer
        bool exist;  //used to see if entry already exists
    }

    //define events for Steel
    event SteelBatchCasted(uint steelBatchID);
    event SteelBatchForSale(uint steelBatchID);
    event SteelBatchSold(uint steelBatchID);
    event SteelBatchShipped(uint steelBatchID);
    event SteelBatchReceived(uint steelBatchID);

    //define events for Part
    event PartProduced(uint upc);
    event PartPacked(uint upc);
    event PartForSale(uint upc);
    event PartSold(uint upc);
    event PartShipped(uint upc);
    event PartReceived(uint upc);
    event PartPurchased(uint upc);

    //Define a modifier that verifies the Caller
    modifier verifyCaller (address _address) {
        require(msg.sender == _address);
        _;
    }

    //Define a modifier that checks if that paid amount is enough to cover the Price
    modifier paidEnough(uint _price) {
        require(msg.value >= _price, "Insufficient funding.");
        _;
    }

    //define a modifier that checks the value of Steel
    modifier checkSteelValue(uint _steelBatchID){
        _;
        uint _price = steel[_steelBatchID].steelPrice;
        uint refundAmount = msg.value - _price;
        steel[steelBatchID].ownerID.transfer(refundAmount);
    }

    //define a modifier that checks the value for the part
    modifier checkValue(uint _upc){
        _;
        uint _price = items[_upc].partPrice;
        uint refundAmount = msg.value - _price;
        items[_upc].ownerID.transfer(refundAmount);
    }

    //define a modifier to check if steelBatch exists
    modifier steelBatchAlreadyExists(uint _steelBatchID) {
        SteelBatch memory _steel = steel[steelBatchID];
        require(!_steel.exist, "This Steel Batch ID already exists.");
        _;
    }

    //define a modifier that checks if steelbatch is casted
    modifier steelBatchCasted(uint _steelBatchID) {
        require(steel[_steelBatchID].steelState == SteelState.Casted, "Steel has not been casted");
        _;
    }

    //define a modifier that checks if steelbatch is for sale
    modifier steelBatchForSale(uint _steelBatchID) {
        require(steel[_steelBatchID].steelState == SteelState.ForSale, "Steel is not for sale");
        _;
    }

    //define a modifier that checks if steelbatch is sold
    modifier steelBatchSold(uint _steelBatchID) {
        require(steel[_steelBatchID].steelState == SteelState.Sold, "Steel is not sold");
        _;
    }

    //define a modifier that checks if steelbatch is shipped
    modifier steelBatchShipped(uint _steelBatchID) {
        require(steel[_steelBatchID].steelState == SteelState.Shipped, "Steel has not been shipped");
        _;
    }

    //define a modifier that checks if steelbatch is received
    modifier steelBatchReceived(uint _steelBatchID) {
        require(steel[_steelBatchID].steelState == SteelState.Received, "Steel has not been received");
        _;
    }

    //define a modifier that checks if a part already exists
    modifier partAlreadyExists(uint _upc) {
        Part memory _part = items[_upc];
        require(!_part.exist, "Part upc already exists.");
        _;
    }

    //Couldn't get this to work so commeted it out
    //define a modifier that checks if a producer has and owns the steel needed for a part
    /*modifier partProducerHasAndOwnsSteel(uint _steelID) {
        for (uint i=0; i<bytes(_steelID).length; i++) {
            uint _steelBatchID = _steelID[i];
            require(steel[_steelBatchID].ownerID == msg.sender, "Producer does not own the steel for making this part.");
            require(steel[_steelBatchID].steelState == SteelState.Received, "Producer has not received all the steel needed for this part.");
        }
        _;
    }*/

    //define a modifier that checks if part is Produced
    modifier partProduced(uint _upc) {
        require(items[_upc].partState == PartState.Produced, "Part is not produced yet");
        _;
    }

    //define a modifier that checks if part is Packed
    modifier partPacked(uint _upc) {
        require(items[_upc].partState == PartState.Packed, "Part is not packed yet");
        _;
    }

    //define a modifier that checks if part is ForSale
    modifier partForSale(uint _upc) {
        require(items[_upc].partState == PartState.ForSale, "Part is not for sale yet");
        _;
    }

    //define a modifier that checks if part is Sold
    modifier partSold(uint _upc) {
        require(items[_upc].partState == PartState.Sold, "Part is not sold yet");
        _;
    }

    // Define a modifier that checks if a part is Shipped
    modifier partShipped(uint _upc) {
        require(items[_upc].partState == PartState.Shipped);
      _;
    }

    // Define a modifier that checks if a part is Received
    modifier partReceived(uint _upc) {
        require(items[_upc].partState == PartState.Received);
      _;
    }

    // Define a modifier that checks if a part is Purchased
    modifier partPurchased(uint _upc) {
        require(items[_upc].partState == PartState.Purchased);
      _;
    }

    //set sku to 1
    //set upc to 1
    //set steelBatchID to 1
    constructor() public payable{
        sku = 1;
        upc = 1;
        steelBatchID = 1;
    }

    //Define a function 'kill' if required
    function kill() public onlyOwner {
        address payable ownKiller = address(uint160(owner()));
        if (msg.sender == owner()){
            selfdestruct(ownKiller);
        }
    }


    //////////////////////////////////////////////
    //////// STEEL BATCH OPERATIONS /////////////
    /////////////////////////////////////////////

    //Define function 'castSteel' that allows a steelMaker to mark steel as Casted
    function castSteel(uint _steelBatchID, string memory _steelMill, string memory _steelMillInformation, string memory _steelMillLatitude, string memory _steelMillLongitude, string memory _steelMillNotes)
    public {
        //add new steelBatch
        steel[_steelBatchID] = SteelBatch({
            steelBatchID: steelBatchID,
            ownerID: msg.sender,
            steelMakerID: msg.sender,
            steelMill: _steelMill,
            steelMillInformation: _steelMillInformation,
            steelMillLatitude: _steelMillLatitude,
            steelMillLongitude: _steelMillLongitude,
            steelMillNotes: _steelMillNotes,
            steelPrice: 0,
            steelState: SteelState.Casted,
            exist: true
        });

        //Increment steelBatchID
        steelBatchID = steelBatchID + 1;

        //Emit event SteelBatchCasted()
        emit SteelBatchCasted(_steelBatchID);
    }

    //Define a function 'sellSteelBatch()' that allows a steelMaker list steel for sale
    function sellSteelBatch(uint _steelBatchID, uint _steelPrice)
    public steelBatchCasted(_steelBatchID) verifyCaller(steel[_steelBatchID].ownerID) {
        //storing steel *saves me a lot of repeated writing*
        SteelBatch storage steels = steel[_steelBatchID];
        //update steel to 'ForSale'
        steels.steelState = SteelState.ForSale;
        //update steelPrice
        steels.steelPrice = _steelPrice;
        //emit SteelBatchForSale()
        emit SteelBatchForSale(_steelBatchID);
    }

    //define a function 'buySteelBatch' that allows a PartProducer to buy steel
    function buySteelBatch(uint _steelBatchID)
    public payable steelBatchForSale(_steelBatchID) paidEnough(steel[_steelBatchID].steelPrice) checkSteelValue(_steelBatchID) {
        //storing steel *saves me a lot of repeated writing*
        SteelBatch storage steels = steel[_steelBatchID];
        //update steel to 'Sold'
        steels.steelState = SteelState.Sold;
        //fetch price and set variable
        uint _steelPrice = steels.steelPrice;
        //transfer Price to steelMaker
        steels.ownerID = msg.sender;
        steels.steelMakerID.transfer(_steelPrice);
        //emit event SteelBatchSold
        emit SteelBatchSold(_steelBatchID);
    }

    //Define a function 'shipSteelBatch' that allows a steelMaker to mark steel as Shipped
    function shipSteelBatch(uint _steelBatchID)
    public steelBatchSold(_steelBatchID) verifyCaller(steel[_steelBatchID].steelMakerID) {
        //storing steel *saves me a lot of repeated writing*
        SteelBatch storage steels = steel[_steelBatchID];
        //update steel to 'Shipped'
        steels.steelState = SteelState.Shipped;
        //emit event 'SteelBatchShipped()'
        emit SteelBatchShipped(_steelBatchID);
    }

    //Define a function 'receiveSteelBatch' that allows a partProducer to mark steel as Received
    function receiveSteelBatch(uint _steelBatchID)
    public steelBatchShipped(_steelBatchID) verifyCaller(steel[_steelBatchID].ownerID) {
        //storing steel *saves me a lot of repeated writing*
        SteelBatch storage steels = steel[_steelBatchID];
        //update steel to 'Received'
        steels.steelState = SteelState.Received;
        //emit event 'steelBatchReceived()'
        emit SteelBatchReceived(_steelBatchID);
    }

    //Define a function 'fetchSteelBatch' to fetch data
    function fetchSteelBatch(uint _steelBatchID) public view returns(
        uint steelSteelBatchID,                //0
        address payable ownerID,               //1
        address payable steelMakerID,          //2
        string memory steelMill,               //3
        string memory steelMillInformation,    //4
        string memory steelMillLatitude,       //5
        string memory steelMillLongitude,      //6
        string memory steelMillNotes,          //7
        uint steelPrice,                       //8
        SteelState steelState                  //9
    ) {
        //storing steel *saves me a lot of repeated writing*
        SteelBatch storage steels = steel[_steelBatchID];
        steelSteelBatchID = steels.steelBatchID;
        ownerID = steels.ownerID;
        steelMakerID = steels.steelMakerID;
        steelMill = steels.steelMill;
        steelMillInformation = steels.steelMillInformation;
        steelMillLatitude = steels.steelMillLatitude;
        steelMillLongitude = steels.steelMillLongitude;
        steelMillNotes = steels.steelMillNotes;
        steelPrice = steels.steelPrice;
        steelState = steels.steelState;
    }

    ////////////////////////////////////////////
    //////////// Part Operations //////////////
    //////////////////////////////////////////

    //Define a function 'producePart' that allows PartProducer to create a part
    function producePart(uint _upc, string memory _producerName, string memory _producerInformation, string memory _producerLatitude, string memory _producerLongitude, string memory _partNotes)
    public {
        //create partID
        uint _partID = sku + _upc;
        //create part
        items[_upc] = Part({
            sku: sku,
            upc: upc,
            ownerID: msg.sender,
            partProducerID: msg.sender,
            producerName: _producerName,
            producerInformation: _producerInformation,
            producerLatitude: _producerLatitude,
            producerLongitude: _producerLongitude,
            partID: _partID,
            partNotes: _partNotes,
            partPrice: 0,
            partState: PartState.Produced,
            distributorID: address(0),
            retailerID: address(0),
            consumerID: address(0),
            exist: true
        });
        //update upc and SKU
        upc = upc + 1;
        sku = sku + 1;
        //emit 'PartProduced'
        emit PartProduced(_upc);
    }

    //Define a function 'packPart' that allows a PartProducer to mark a part as 'Packed'
    function packPart(uint _upc)
    public partProduced(_upc) verifyCaller(items[_upc].ownerID) {
        //store part to save repeated writing
        Part storage part = items[_upc];
        //update partState
        part.partState = PartState.Packed;
        //emit PartPacked()
        emit PartPacked(_upc);
    }

    //Define a function 'sellPart' that allows a PartProducer to mark a part 'ForSale'
    function sellPart(uint _upc, uint _partPrice)
    public partPacked(_upc) verifyCaller(items[_upc].ownerID) {
        //store part to save repeated writing
        Part storage part = items[_upc];
        //update partState
        part.partState = PartState.ForSale;
        //set partPrice
        part.partPrice = _partPrice;
        emit PartForSale(_upc);
    }

    //Define a function 'buyPart' that allows a Distributor to buy a part
    function buyPart(uint _upc)
    public payable partForSale(_upc) paidEnough(items[_upc].partPrice) checkValue(_upc) {
        //store part to save repeated writing
        Part storage part = items[_upc];
        //update DistributorID
        part.distributorID = msg.sender;
        //update partState
        part.partState = PartState.Sold;
        //transfer ownership and currency
        uint _partPrice = part.partPrice;
        part.ownerID = msg.sender;
        part.partProducerID.transfer(_partPrice);
        //emit 'PartSold()'
        emit PartSold(_upc);
    }

    //define a function 'shipPart' that allows a PartProducer to mark a part as shipped
    function shipPart(uint _upc)
    public partSold(_upc) verifyCaller(items[_upc].partProducerID) {
        //store part to save repeated writing
        Part storage part = items[_upc];
        //update partState
        part.partState = PartState.Shipped;
        //emit 'PartShipped()'
        emit PartShipped(_upc);
    }

    //Define a function 'recievePart' that allows a retailer to mark a part as received and set a retail Price
    function receivePart(uint _upc, uint _partRetailPrice)
    public partShipped(_upc) {
        //store part to save repeated writing
        Part storage part = items[_upc];
        //update partState
        part.partState = PartState.Received;
        //update ownerID and retailerID
        part.ownerID = msg.sender;
        part.retailerID = msg.sender;
        //set retail price
        part.partPrice = _partRetailPrice;
        //emit 'Partreceived'
        emit PartReceived(_upc);
    }

    //Define a function 'purchasePart' that allows a consumer to purchase a part
    function purchasePart(uint _upc)
    public payable partReceived(_upc) paidEnough(items[_upc].partPrice) checkValue(_upc){
        //store part to save repeated writing
        Part storage part = items[_upc];
        //update partState
        part.partState = PartState.Purchased;
        //update ownerID and consumerID
        part.ownerID = msg.sender;
        part.consumerID = msg.sender;
        //transfer funds
        uint _partPrice = part.partPrice;
        part.retailerID.transfer(_partPrice);
        //emit 'PartPurchased()'
        emit PartPurchased(_upc);
    }

    //Define a function 'fetchPartOne' to fetch part data
    function fetchPartOne(uint _upc)
    public view returns (
        uint partSku,                     //0
        uint partUpc,                     //1
        address payable ownerID,          //2
        address payable partProducerID,   //3
        uint partPrice,                   //4
        PartState partState,              //5
        address distributorID,            //6
        address retailerID,               //7
        address consumerID                //8
    ) {
        //store part to save repeated writing
        Part storage part = items[_upc];
        partSku = part.sku;
        partUpc = part.upc;
        ownerID = part.ownerID;
        partProducerID = part.partProducerID;
        partPrice = part.partPrice;
        partState = part.partState;
        distributorID = part.distributorID;
        retailerID = part.retailerID;
        consumerID = part.consumerID;
    }

    //Define a function 'fetchPartTwo' to fetch part data
    function fetchPartTwo(uint _upc)
    public view returns (
        uint partSku,                        //0
        string memory producerName,          //1
        string memory producerInformation,   //2
        string memory producerLatitude,      //3
        string memory producerLongitude,     //4
        uint partID,                         //5
        string memory partNotes              //6
    ) {
        //store part to save repeated writing
        Part storage part = items[_upc];
        partSku = part.sku;
        producerName = part.producerName;
        producerInformation = part.producerInformation;
        producerLatitude = part.producerLatitude;
        producerLongitude = part.producerLongitude;
        partID = part.partID;
        partNotes = part.partNotes;
    }

 }
