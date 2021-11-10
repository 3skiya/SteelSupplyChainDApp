# Supply Chain DApp for Udacity

## General Write Up
The Project 6 by Udacity was really outdated so I decided to update everythingto work with the current version of truffle and solidity(truffle -v5.4.12, solidity -v0.5.16). For the project itself I decided to do a supply chain tracking steel and parts made from that steel batch. The general premise is that steel is tracked from the moment it is casted, through the selling to a production plant, to the part it is made, then the part is tracked from its creation to its respective buyer.
## Libraries Used
**fs** -- used for file syncing of the .secret file that holds mnemonic
**truffle** -- Ease of use with solidity contracts and deployments
**truffle-assertions** -- Not needed, but I think the eventEmitted in testing makes more logical sense.
**truffle-hdwallet-provider** -- Used for rinkeby deployment of the contracts
**web3** -- Used for the integration of metamask on the frontend of the DApp
**Ganache** -- *GANACHE IS NOT A LIBRARY* but I did use it for testing instead of my private metamask account, the truffle-config.js file will reflect this.
## UML Diagrams
The Diagrams I used for making this Project:

### Activity Diagram
![Activity Diagram](/UML/Activity_Diagram.png)

### Class Diagram
![Class Diagram](/UML/Class_Diagram.png)

### Sequence Diagram
![Sequence Diagram](/UML/Sequence_Diagram.png)

### State Diagram
![State Diagram](/UML/State_Diagram.png)


## Other Rubric Criteria
These are some solutions to other criteria on the rubric that needed to be met:
### Test Smart Contract
![tested smart contract](/UML/Test_Successful.jpg)

###Modify Front End To Interact With Smart Contract
![working front end](/UML/Working_Website.jpg)

### TX Hash and Contract Address For Deployed Rinkeby DAPP:
transaction hash:    0xbe5d0e3c2cf76cdd2b0e12c8c84473b2646fc19fb354a7351e67a767c0505321
contract address:    0x80399c32439C9d00168bFD083872b0bE2e6c995e
