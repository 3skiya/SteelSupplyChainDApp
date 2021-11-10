pragma solidity >=0.5.0;

// Import the library 'Roles'
import "./Roles.sol";

// Define a contract 'SteelMakerRole' to manage this role - add, remove, check
contract SteelMakerRole {
  using Roles for Roles.Role;

  // Define 2 events, one for Adding, and other for Removing
  event SteelMakerAdded(address indexed account);
  event SteelMakerRemoved(address indexed account);

  // Define a struct 'SteelMakers' by inheriting from 'Roles' library, struct Role
  Roles.Role private SteelMakers;

  // In the constructor make the address that deploys this contract the 1st SteelMaker
  constructor() public {
    _addSteelMaker(msg.sender);
  }

  // Define a modifier that checks to see if msg.sender has the appropriate role
  modifier onlySteelMaker() {
    require(isSteelMaker(msg.sender));
    _;
  }

  // Define a function 'isSteelMaker' to check this role
  function isSteelMaker(address account) public view returns (bool) {
    return SteelMakers.has(account);
  }

  // Define a function 'addSteelMaker' that adds this role
  function addSteelMaker(address account) public onlySteelMaker {
    _addSteelMaker(account);
  }

  // Define a function 'renounceSteelMaker' to renounce this role
  function renounceSteelMaker() public {
    _removeSteelMaker(msg.sender);
  }

  // Define an internal function '_addSteelMaker' to add this role, called by 'addSteelMaker'
  function _addSteelMaker(address account) internal {
    SteelMakers.add(account);
    emit SteelMakerAdded(account);
  }

  // Define an internal function '_removeSteelMaker' to remove this role, called by 'removeSteelMaker'
  function _removeSteelMaker(address account) internal {
    SteelMakers.remove(account);
    emit SteelMakerRemoved(account);
  }
}
