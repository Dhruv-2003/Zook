// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155URIStorage.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";

contract ERC1155Recepient is
    ERC1155URIStorage,
    Ownable,
    ERC1155Burnable,
    ERC1155Supply
{
    address public moduleManager;

    //  Sender  => Token ID
    mapping(address => uint) public senderTokenInfo;
    uint public totalTokenIdsGenerated = 1;

    /*======================== Constructor Functions ========================*/
    /**
     * @dev Intialise the Educator Badge NFT Collections
     *
     * @param _moduleManager Address of the module manager
     */
    constructor(address _moduleManager) ERC1155("") {
        moduleManager = _moduleManager;
    }

    modifier onlyModuleManager() {
        require(msg.sender == moduleManager, "ONLY MODULE MANAGER");
    }

    // =============================================================
    //                           EXTNERNAL FUNCTIONS
    // =============================================================

    function setManager(address _newManager) public onlyOwner {
        moduleManager = _newManager;
        _;
    }

    function createTokenForSender() public returns (uint tokenId) {
        tokenId = totalTokenIdsGenerated;
        senderTokenInfo[msg.sender] = tokenId;
        totalTokenIdsGenerated += 1;
    }

    /**
     * @dev Set URI for a NFT Badge
     *
     * @param tokenId  token Id of the badge for which URI has to be sets
     * @param tokenURI  token URI of the new Badge to be set
     */
    function setURI(
        uint tokenId,
        string memory tokenURI
    ) external onlyModuleManager {
        _setURI(tokenId, tokenURI);
    }

    /**
     * @dev Mint New Educator badges for the Educators
     *
     * @param account  address to which the badge to be minted
     * @param tokenId  token Id of the badge to be minted
     */
    function mintRecepientNFT(
        address account,
        uint tokenId
    ) external onlyModuleManager {
        _mint(account, tokenId, 1, "");
    }

    // =============================================================
    //                           PUBLIC FUNCTIONS
    // =============================================================

    /**
     * @dev Get Token URI for the badge
     *
     * @param tokenId  token Id of the badge for which URI to be fetched
     */
    function uri(
        uint256 tokenId
    )
        public
        view
        virtual
        override(ERC1155URIStorage, ERC1155)
        returns (string memory)
    {
        return ERC1155URIStorage.uri(tokenId);
    }

    // =============================================================
    //                           INTERNAL FUNCTIONS
    // =============================================================

    /**
     * @dev _beforeTokenTransfer -  implements the function from a Superior Contract
     *
     */
    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal override(ERC1155, ERC1155Supply) {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
    }
}
