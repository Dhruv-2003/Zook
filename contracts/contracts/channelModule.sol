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
        address recepient; // Recepient for the Channel
        uint expiration;
        uint tokenId; // ERC1155 NFT for Recepient Proof
        bool isInitialised;
    }

    // channel ID => Channel Data
    mapping(uint => ChannelData) public channelInfos;
    uint public totalChannels = 1;

    // Channel Address => channelId
    mapping(address => uint) public channelAddressInfos;

    mapping(address => uint) public senderTokenInfo;
    uint public totalTokenIdsGenerated = 1;

    constructor(address recepientNFTAddr) {
        recepientNFT = ERC1155Recepient(recepientNFTAddr);
    }

    modifier onlyInititalised(uint channelId) {
        ChannelData memory _channelData = channelInfos[channelId];
        require(_channelData.isInitialised, "NOT YET INITIALISED");
        _;
    }

    function createTokenForSender() public returns (uint tokenId) {
        tokenId = totalTokenIdsGenerated;
        senderTokenInfo[msg.sender] = tokenId;
        totalTokenIdsGenerated += 1;
    }

    // initialise the channel if not there
    // mint a NFT to the Reciever when the channel is started
    // add the recepient to the Array
    function createChannel(
        address safe,
        address recepient,
        uint duration,
        uint tokenId
    ) public returns (uint channelId) {
        require(channelAddressInfos[safe] == 0, "CHANNEL ALREADY CREATED");
        channelId = totalChannels;
        ChannelData memory _channelData = ChannelData(
            msg.sender,
            safe,
            recepient,
            block.timestamp + duration,
            tokenId,
            true
        );

        recepientNFT.mintRecepientNFT(recepient, tokenId);

        channelInfos[channelId] = _channelData;
        channelAddressInfos[safe] = channelId;

        totalChannels += 1;
    }

    function extendChannelDuration(
        uint channelId,
        uint256 newExpiration
    ) public {
        ChannelData memory _channelData = channelInfos[channelId];
        require(msg.sender == _channelData.sender, "ONLY OWNER");
        require(newExpiration > _channelData.expiration);
        _channelData.expiration = newExpiration;

        channelInfos[channelId] = _channelData;
    }

    // withdraw funds for the Reciever to claim the amount
    function executeWithdraw(
        uint channelId,
        bytes32 _hash,
        bytes memory signature,
        uint96 amount
    ) public {
        ChannelData memory _channelData = channelInfos[channelId];

        // Use sismo here directly to show if the recepient is the msg.sender or not , and generate the ZK proof , to be verified here
        require(
            recepientNFT.balanceOf(msg.sender, _channelData.tokenId) > 0,
            "NOT A RECEPIENT"
        );

        // verify if the signature is valid or not
        // verifying if the Sender is actually the signer
        require(isValidSignature(_hash, signature, _channelData.sender));

        // parse inputs from the hash for checking the proofs on chain

        // Check if the amount is actually available in the contract or not

        // Signature is for this safe Channel only

        address token = address(0); // will be hardhcoded

        // send the funds from the Safe to the Recepeint
        transfer(
            GnosisSafe(_channelData.safeAddress),
            token,
            payable(msg.sender),
            amount
        );

        // Dispense the remaining to the Sender back
        uint96 remainingAmount = uint96(
            address(_channelData.safeAddress).balance
        );
        transfer(
            GnosisSafe(_channelData.safeAddress),
            token,
            payable(_channelData.sender),
            remainingAmount
        );
    }

    // close channel by sender in case they want to after the duration completed
    function executeCloseChannel(uint channelId) public {
        ChannelData memory _channelData = channelInfos[channelId];
        require(
            block.timestamp >= _channelData.expiration,
            "CHANNEL NOT EXPIRED"
        );

        address token = address(0);

        uint96 remainingAmount = uint96(
            address(_channelData.safeAddress).balance
        );
        transfer(
            GnosisSafe(_channelData.safeAddress),
            token,
            payable(_channelData.sender),
            remainingAmount
        );
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
                safe.execTransactionFromModule(
                    to,
                    amount,
                    "",
                    GnosisSafe.Operation.Call
                ),
                "Could not execute ether transfer"
            );
        } else {
            bytes memory data = abi.encodeWithSignature(
                "transfer(address,uint256)",
                to,
                amount
            );
            require(
                safe.execTransactionFromModule(
                    token,
                    0,
                    data,
                    GnosisSafe.Operation.Call
                ),
                "Could not execute token transfer"
            );
        }
    }

    function isValidSignature(
        bytes32 hash,
        bytes memory signature,
        address sender
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
