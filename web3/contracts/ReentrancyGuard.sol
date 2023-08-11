// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

abstract contract ReentrancyGuard  {
 
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;

    constructor() {
       _status = _NOT_ENTERED;        
    }

    modifier nonReetrant() {
        require(_status != _ENTERED, 'ReentrancyGuard: reentrant call');
        _status = _ENTERED;
        _;
        _status = _NOT_ENTERED;
    }
}


