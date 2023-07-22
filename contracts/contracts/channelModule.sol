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
        address safeAddress;
        address[] recepients; // All the recepients for the channel
        // duration
        uint tokenId; // ERC1155 NFT for Recepient Proof
        bool isInitialised;
    }

    // channel ID => Channel Data
    mapping(uint => ChannelData) public channelInfos;
    uint public totalChannels = 1;

    // Channel Address => channelId
    mapping(address => uint) public channelAddressInfos;

    constructor(address recepientNFTAddr) {
        recepientNFT = ERC1155Recepient(recepientNFTAddr);
    }

    modifier onlyInititalised(uint channelId) {
        ChannelData memory _channelData = channelInfos[channelId];
        require(_channelData.isInitialised, "NOT YET INITIALISED");
        _;
    }

    // initialise the channel if not there
    // mint a NFT to the Reciever when the channel is started
    // add the recepient to the Array
    function createChannel(
        address safe,
        address initialRecep,
        uint duration
    ) public returns (uint channelId) {
        channelId = totalChannels;
        // token ID  ==  channel ID , so all these NFT Holders gets access to the safe Module functions
        ChannelData memory _channelData = new ChannelData(
            msg.sender,
            safe,
            [initialRecep],
            channelId,
            true
        );

        uint tokenId = channelId;
        recepientNFT.mintRecepientNFT(initialRecep, tokenId);

        channelInfos[channelId] = _channelData;
        channelAddressInfos[safe] = channelId;
    }

    // Add an extra recepeint if needed
    function addRecepient(
        uint channelId,
        address newRecep,
        uint duration
    ) public onlyInititalised(channelId) {
        ChannelData memory _channelData = channelInfos[channelId];
        require(
            recepientNFT.balanceOf(newRecep, _channelData.tokenId) < 1,
            "ALREADY A RECEPIENT"
        );
        _channelData.recepients.push(newRecep);
        recepientNFT.mintRecepientNFT(newRecep, _channelData.tokenId);

        channelInfos[channelId] = _channelData;
    }

    // withdraw funds for the Reciever to claim the amount
    function executeWithdraw(
        uint channelId,
        bytes32 _hash,
        bytes memory signature,
        uint amount
    ) public {
        ChannelData memory _channelData = channelInfos[channelId];
        require(
            recepientNFT.balanceOf(msg.sender, _channelData.tokenId) > 0,
            "NOT A RECEPIENT"
        );

        // verify if the signature is valid or not
        // verifying if the Sender is actually the signer
        require(isValidSignature(_hash, signature));

        // parse inputs from the hash for checking the proofs on chain

        // Check if the amount is actually available in the contract or not

        // Signature is for this safe Channel only

        address token = address(0); // will be hardhcoded

        // send the funds from the Safe to the User
        transfer(_channelData.safeAddress, token, msg.sender, amount);
    }

    function transfer(
        GnosisSafe safe,
        address token,
        address payable to,
        uint96 amount
    ) private {
        if (token == address(0)) {
            // solium-disable-next-line security/no-send
            require(
                safe.execTransactionFromModule(to, amount, "", Operation.Call),
                "Could not execute ether transfer"
            );
        } else {
            bytes memory data = abi.encodeWithSignature(
                "transfer(address,uint256)",
                to,
                amount
            );
            require(
                safe.execTransactionFromModule(token, 0, data, Operation.Call),
                "Could not execute token transfer"
            );
        }
    }

    // close channel by sender in case they want to after the duration completed
    function executeCloseChannel() public {}

    // function extendChannel(uint256 newExpiration) public {
    //     require(msg.sender == sender);
    //     require(newExpiration > expiration);
    //     expiration = newExpiration;
    // }

    // // If the timeout is reached without the recipient closing the channel, then
    // // the ether is released back to the sender.
    // function claimTimeout() public {
    //     require(block.timestamp >= expiration);
    //     selfdestruct(payable(sender));
    // }

    function isValidSignature(
        bytes32 hash,
        bytes memory signature
    ) public view returns (bool) {
        // Check that the signature is from the payment sender.
        return recoverSigner(hash, signature) == sender;
    }

    function recoverSigner(
        bytes32 message,
        bytes memory sig
    ) public pure returns (address) {
        uint8 v;
        bytes32 r;
        bytes32 s;

        (v, r, s) = splitSignature(sig);

        return ecrecover(message, v, r, s);
    }

    function splitSignature(
        bytes memory sig
    ) public pure returns (uint8, bytes32, bytes32) {
        require(sig.length == 65);

        bytes32 r;
        bytes32 s;
        uint8 v;

        assembly {
            // first 32 bytes, after the length prefix
            r := mload(add(sig, 32))
            // second 32 bytes
            s := mload(add(sig, 64))
            // final byte (first byte of the next 32 bytes)
            v := byte(0, mload(add(sig, 96)))
        }

        return (v, r, s);
    }
}
