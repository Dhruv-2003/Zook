// SPDX-License-Identifier: LGPL-3.0-only
pragma solidity ^0.8.18;

import {BasePluginWithEventMetadata, PluginMetadata} from "./Base.sol";
import {ISafe} from "@safe-global/safe-core-protocol/contracts/interfaces/Accounts.sol";
import {ISafeProtocolManager} from "@safe-global/safe-core-protocol/contracts/interfaces/Manager.sol";
import {SafeTransaction, SafeProtocolAction} from "@safe-global/safe-core-protocol/contracts/DataTypes.sol";

address constant NATIVE_TOKEN = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

contract ChannelPlugin is BasePluginWithEventMetadata {
    constructor()
        BasePluginWithEventMetadata(
            PluginMetadata({
                name: "Relay Plugin",
                version: "1.0.0",
                requiresRootAccess: false,
                iconUrl: "",
                appUrl: "https://5afe.github.io/safe-core-protocol-demo/#/relay/${plugin}"
            })
        )
    {}

    function setMaxFeePerToken(address token, uint256 maxFee) external {
        maxFeePerToken[msg.sender][token] = maxFee;
        emit MaxFeeUpdated(msg.sender, token, maxFee);
    }

    function executeAction(
        ISafeProtocolManager manager,
        ISafe safe,
        uint256 nonce
    ) internal {
        SafeProtocolAction[] memory actions = new SafeProtocolAction[](1);

        // If a ERC20 token is used for fee payment, then we trigger a token transfer on the token for the fee to the fee collector
        actions[0].to = payable(feeToken);
        actions[0].value = 0;
        actions[0].data = abi.encodeWithSignature(
            "transfer(address,uint256)",
            feeCollector,
            fee
        );

        // Note: Metadata format has not been proposed
        SafeTransaction memory safeTx = SafeTransaction({
            actions: actions,
            nonce: nonce,
            metadataHash: bytes32(0)
        });
        try manager.executeTransaction(safe, safeTx) returns (
            bytes[] memory
        ) {} catch (bytes memory reason) {}
    }

    function executeFromPlugin(
        ISafeProtocolManager manager,
        ISafe safe,
        bytes calldata data
    ) external {
        // We use the hash of the tx to relay has a nonce as this is unique
        uint256 nonce = uint256(
            keccak256(abi.encode(this, manager, safe, data))
        );
        payFee(manager, safe, nonce);
    }
}
