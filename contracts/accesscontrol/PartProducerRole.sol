pragma solidity >=0.5.0;

// Import the library 'Roles'
import "./Roles.sol";

// Define a contract 'PartProducerRole' to manage this role - add, remove, check
contract PartProducerRole {
  using Roles for Roles.Role;

  // Define 2 events, one for Adding, and other for Removing
  event PartProducerAdded(address indexed account);
  event PartProducerRemoved(address indexed account);

  // Define a struct 'PartProducers' by inheriting from 'Roles' library, struct Role
  Roles.Role private PartProducers;

  // In the constructor make the address that deploys this contract the 1st PartProducer
  constructor() public {
    _addPartProducer(msg.sender);
  }

  // Define a modifier that checks to see if msg.sender has the appropriate role
  modifier onlyPartProducer() {
    require(isPartProducer(msg.sender));
    _;
  }

  // Define a function 'isPartProducer' to check this role
  function isPartProducer(address account) public view returns (bool) {
    return PartProducers.has(account);
  }

  // Define a function 'addPartProducer' that adds this role
  function addPartProducer(address account) public onlyPartProducer {
    _addPartProducer(account);
  }

  // Define a function 'renouncePartProducer' to renounce this role
  function renouncePartProducer() public {
    _removePartProducer(msg.sender);
  }

  // Define an internal function '_addPartProducer' to add this role, called by 'addPartProducer'
  function _addPartProducer(address account) internal {
    PartProducers.add(account);
    emit PartProducerAdded(account);
  }

  // Define an internal function '_removePartProducer' to remove this role, called by 'removePartProducer'
  function _removePartProducer(address account) internal {
    PartProducers.remove(account);
    emit PartProducerRemoved(account);
  }
}
