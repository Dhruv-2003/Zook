// SPDX-License-Identifier: LGPL-3.0-only
pragma solidity >=0.8.0 <0.9.0;

import "./ERC1155Recepient.sol";

/// execWill start for swapping the owner
interface GnosisSafe {
    enum Operation {
        Call,
        DelegateCall
    }

    /// @dev Allows a Module to execute a Safe transaction without any further confirmations.
    /// @param to Destination address of module transaction.
    /// @param value Ether value of module transaction.
    /// @param data Data payload of module transaction.
    /// @param operation Operation type of module transaction.
    function execTransactionFromModule(
        address to,
        uint256 value,
        bytes calldata data,
        Operation operation
    ) external returns (bool success);
}

contract ChannelModule {
    ERC1155Recepient public recepientNFT;

    // will store some channel infos
    struct ChannelData {
        address sender;
    }

    mapping(uint => ChannelData) public channelInfos;

    constructor(address recepientNFTAddr) {
        recepientNFT = ERC1155Recepient(recepientNFTAddr);
    }

    // mint a NFT to the Reciever when the channel is started
    function createChannel() public {}

    // withdraw funds for the Reciever to claim the amount
    function executeWithdraw() public {}

    // close channel by sender in case they want to after
    function executeCloseChannel() public {}
}
