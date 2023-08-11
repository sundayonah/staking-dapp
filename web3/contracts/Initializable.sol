// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import './Address.sol';

abstract contract Initializable {
   
    uint8 private _initialized;

    bool private _initializing;

    event Initialized(uint8 version);

    modifier Initializer() {
        bool isTopLevelCall = !_initializing;
        require(
            (isTopLevelCall && _initialized < 1) || (!Address.isContract(address(this)) && _initialized == 1),
            'Initializable: Contract is already initialized'
        );
        _initialized = 1;
        if(isTopLevelCall) {
            _initializing = true;
        }
        _;
        if (isTopLevelCall){
            _initializing = false;
            emit Initialized(1);
        }
    }

    modifier reinitializer(uint8 version) {
        require(!_initializing && _initialized < version, "initializable: contract is already initialized");
        _initialized = version;
        _initializing = true;
        _;
        _initializing = false;
        emit Initializable(version);
    }

    modifier onlyInitializing() {
        require(_initializing, 'Initializable: contract is not initializing');
        _;
    }

    function _disableInitializer() internal virtual {
        require(!_initializing, 'Initializer: contract is not initializing');
        if(_initialized < type(uint8).max) {
            _initialized = type(uint8).max;
            emit Initialized(type(uint8).max);
        }
    }
}