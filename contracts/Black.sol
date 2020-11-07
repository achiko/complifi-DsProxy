pragma solidity ^0.5.2;

import './openzeppelin/token/ERC20/ERC20Pausable.sol';
import './openzeppelin/token/ERC20/ERC20Mintable.sol';
import './openzeppelin/token/ERC20/ERC20Burnable.sol';
import './openzeppelin/ownership/Ownable.sol';

contract Black is ERC20Pausable, ERC20Mintable, ERC20Burnable, Ownable {
  
  string public constant name = "Black Test Token";
  string public constant symbol = "BLACK";
  uint8 public constant decimals = 4; 

  
  function removeMinter(address _minter) public onlyOwner {
      _removeMinter(_minter);
  }

  function addMinter(address _minter) public onlyOwner {
      _addMinter(_minter);
  }

}