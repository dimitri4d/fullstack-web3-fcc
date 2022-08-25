// Raffle
// Enter the lottery - paying some amount
// Pick a random winner (verifiable random)
// Winner to be selected every x minutes -> completely automated
// chainline Oracle => Randomness, automated execution (chainline Keeper)

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

// Import this file to use console.log
import "hardhat/console.sol";

error Raffle__notEnoughEthEntered();

contract Raffle {
    // State Variables
    uint256 private immutable i_entranceFee;
    address payable[] private s_players;

    // events
    event RaffeEnter(address indexed player);

    constructor(uint256 _entranceFee) payable {
        i_entranceFee = _entranceFee;
    }

    function enterRaffle() public payable {
        if (msg.value < i_entranceFee) {
            revert Raffle__notEnoughEthEntered();
        }

        s_players.push(payable(msg.sender));

        // emit an event when update a dynamic array or mapping
        // name events with the function name reversed
        emit RaffeEnter(msg.sender);
    }

    // function pickRandomWinner() {}

    function getEntranceFee() public view returns (uint256) {
        return i_entranceFee;
    }

    function getPlayer(uint256 index) public view returns (address) {
        return s_players[index];
    }
}
