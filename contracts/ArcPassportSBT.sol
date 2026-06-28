// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

/// @title ArcPassportSBT
/// @notice Future onchain builder identity for ArcPassport.
/// @dev This ERC721-style token is soulbound: it cannot be transferred once
/// minted. The ArcPassport backend will generate metadata after eligibility
/// checks, and an owner/admin mint flow can mint one Builder Passport per wallet.
contract ArcPassportSBT is ERC721URIStorage, Ownable {
    uint256 private _nextTokenId = 1;

    mapping(address => uint256) public passportOf;

    event PassportMinted(
        address indexed builder,
        uint256 indexed tokenId,
        string tokenURI
    );

    error PassportAlreadyMinted(address builder);
    error PassportDoesNotExist(address builder);
    error SoulboundToken();
    error NotApprovedToBurn();

    constructor(address initialOwner)
        ERC721("ArcPassport Builder Passport", "ARCPASS")
        Ownable(initialOwner)
    {}

    /// @notice Mint one non-transferable Builder Passport to a wallet.
    /// @dev Future minting should happen only after backend eligibility checks
    /// and metadata generation. This function is intentionally owner-only.
    function mintPassport(
        address builder,
        string calldata metadataURI
    ) external onlyOwner returns (uint256 tokenId) {
        if (passportOf[builder] != 0) {
            revert PassportAlreadyMinted(builder);
        }

        tokenId = _nextTokenId;
        _nextTokenId++;

        passportOf[builder] = tokenId;
        _safeMint(builder, tokenId);
        _setTokenURI(tokenId, metadataURI);

        emit PassportMinted(builder, tokenId, metadataURI);
    }

    /// @notice Burn a Builder Passport.
    /// @dev The token holder or contract owner/admin may burn. Burning clears
    /// the wallet-to-token mapping so future policy can decide whether reminting
    /// should be allowed.
    function burn(uint256 tokenId) external {
        address tokenOwner = ownerOf(tokenId);

        if (msg.sender != tokenOwner && msg.sender != owner()) {
            revert NotApprovedToBurn();
        }

        delete passportOf[tokenOwner];
        _burn(tokenId);
    }

    function tokenIdOf(address builder) external view returns (uint256 tokenId) {
        tokenId = passportOf[builder];
        if (tokenId == 0) {
            revert PassportDoesNotExist(builder);
        }
    }

    function transferFrom(
        address,
        address,
        uint256
    ) public pure override(ERC721, IERC721) {
        revert SoulboundToken();
    }

    function safeTransferFrom(
        address,
        address,
        uint256,
        bytes memory
    ) public pure override(ERC721, IERC721) {
        revert SoulboundToken();
    }

    /// @dev Keep approvals disabled as an extra guardrail for soulbound tokens.
    function approve(address, uint256) public pure override(ERC721, IERC721) {
        revert SoulboundToken();
    }

    function setApprovalForAll(address, bool) public pure override(ERC721, IERC721) {
        revert SoulboundToken();
    }

    /// @dev OpenZeppelin v5 routes mint, burn, and transfer through `_update`.
    /// Allow mint (`from == address(0)`) and burn (`to == address(0)`), but
    /// reject wallet-to-wallet movement from any transfer path.
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override returns (address from) {
        from = _ownerOf(tokenId);

        if (from != address(0) && to != address(0)) {
            revert SoulboundToken();
        }

        return super._update(to, tokenId, auth);
    }
}
