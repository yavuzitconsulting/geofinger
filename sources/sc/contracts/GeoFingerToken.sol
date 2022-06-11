//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @dev Implementation of https://eips.ethereum.org/EIPS/eip-721[ERC721] Non-Fungible Token Standard, including
 * the Metadata extension, but not including the Enumerable extension, which is available separately as
 * {ERC721Enumerable}.
 */
contract GeoFingerToken is
    Context,
    ERC165,
    IERC721,
    IERC721Metadata,
    Ownable
{
    using Address for address;
    using Strings for uint256;

    constructor() {
        
        _name = "GeoFingerToken";
        _symbol = "gft";
        _allowedServices[_msgSender()] = true;
        _isMintingActive = true;

    }

    
    struct MessageContainer{
        string message;
        uint128 tokenId;
    }


    //ERC721
    mapping(address => bool) _allowedServices;

    // Mapping from Token to SpotId
    mapping(uint256 => uint64) _claimedSpots;

    // Mapping owner to messageTokenId
    mapping(uint128 => address) _messageCreators;


    // Mapping of Spots to message coin balances
    mapping(uint64 => mapping(address => uint16)) _spotWallet;
    
    // Mapping of owners to famecoints
    mapping(uint64 => mapping(address => uint16)) _fameWallet;

    // Mapping from token ID to approved address
    mapping(uint256 => address) private _tokenApprovals;


    // Mapping from owner to operator approvals
    mapping(address => mapping(address => bool)) internal _operatorApprovals;

    string private _name;

    string private _symbol;
    

    bool private _isMintingActive = true;

   

    //fileHash to txHash
    mapping(uint64 => string[]) _spotMessages;
    mapping(uint128 => uint32) _voteWallet;

    //future plans
    uint32 _maxMessageTokenPerSpot = 10000000;
    
    address[] internal _owners;
    string _baseURL;

    event MintedHashMapEvidence(address creator ,uint256 fromHash, uint256 toHash, uint256 tokenId);
    event AssignedAllowedServiceEvent(address sender ,address addressToAllow);
    event UnassignedAllowedServiceEvent(address sender ,address addressToUnassign);
    event MintedMessage(address sender,uint64 spotId, uint256 messageTokenId);
    event SpotClaimed(address sender,uint32 tokenId,uint64 spotId);


    function setBaseURI(string memory uri) public onlyOwner {
        _baseURL = uri;
    }


    function getIsMintingActive() public view returns (bool){
        return _isMintingActive;
    }

    function setIsMintingActive() public onlyOwner {
        _isMintingActive = true;
    }

    function setIsMintingInactive() public onlyOwner {
        _isMintingActive = false;
    }


    modifier isService()
    {
        require(_allowedServices[_msgSender()] == true,"Caller has to be an assigned/allowed service.");
        _; //default return
    }


    function _getSpotIdForCoordinates(uint32 longitude, uint32 latitude) internal returns (uint64)
    {
          //app has to transmit the last 6 characters after decimal point of coordinate
        uint8 longAngle = (uint8)(longitude / 1000000); //starting from a point on the poles, draw lines in this angle along the longitude of earth
        uint32 longDecimal100sqm =( longitude - longAngle * 1000000 ) / 100;
        //longDecimal100sqm needs a transformation --> 10/90 * angel * 100 === 100m for a millionth decimal digit //adapt to changing spot sizes when nearing the poles (imagine a grid on the planet)
       
        uint32 longSpot = longAngle * 1000000 + longDecimal100sqm * 100;
        uint8 latAngle = (uint8)(latitude / 1000000);
        uint32 latDecimal100sqm =( latitude - latAngle * 1000000 ) / 100; //size of a grid element 
        uint32 latSpot = latAngle * 1000000 + latDecimal100sqm * 100;
        uint64 spotId = longSpot * 1000000000 + latSpot; //longSpot is shifted left and latSpot is added
        return spotId;
    }

    function mintMessage(string memory uniCodeMessage, uint32 longitude, uint32 latitude, bool autoConvertFame) public
    {
        require(_isMintingActive, "Mint is currently not active");
        require(bytes(uniCodeMessage).length > 0);
        
      uint64 spotId = _getSpotIdForCoordinates(longitude, latitude);

        if(!_existsSpot(spotId))
        {
            uint32 tokenId = (uint32)(_owners.length);
            _mint(_msgSender(),tokenId);
            _addMessageCoin(spotId);
            _addFameCoin(_msgSender(), 20);
            _spotMessages[spotId]=[];
            _claimedSpots[tokenId] = spotId;
            emit SpotClaimed(_msgSender(),tokenId, spotId);
        }

        _mintMessageOnSpot(spotId, uniCodeMessage, autoConvertFame);
    }

    function _existsSpot(uint64 spotId) internal returns (bool)
    {
        return _claimedSpots[spotId] != 0;
    }

    function _addMessageCoin(uint64 spotId) internal
    {
        _spotWallet[spotId][_msgSender()]++;
    }


    //this returns a teaser of the messages
    function getTeasedMessagesForSpot(uint32 longitude, uint32 latitude) public view returns (MessageContainer[] calldata)
    {
        uint64 spotId = _getSpotIdForCoordinates(longitude, latitude);
        MessageContainer[] calldata messages;
        string[] calldata messagesForSpot = _spotMessages[spotId];

        for (uint i=0; i<messagesForSpot.length; i++) {
            messages.push(MessageContainer(substring(messagesForSpot[i], 0, ((uint16)(messagesForSpot[i].length / 10))+3),(i + spotId * _maxMessageTokenPerSpot)));
        }
        
        return messages;
    }


    function substring(string memory str, uint startIndex, uint endIndex) public pure returns (string memory) {
        bytes memory strBytes = bytes(str);
        bytes memory result = new bytes(endIndex-startIndex);
        for(uint i = startIndex; i < endIndex; i++) {
            result[i-startIndex] = strBytes[i];
        }
        return string(result);
    }

    
    //this is important for fame distribution, glory leads to glamour
    function readMessage(uint128 messageTokenId) public returns (string calldata)
    {
        require(_fameWallet[_msgSender()] > 0);
        require(_spotMessages[messageTokenId] != '');
        _fameWallet[_msgSender()]--;

        _addFameCoin(_messageCreators[messageTokenId],2); // an upvote earns you 1 famecoin1
        _addFameCoin(_claimedSpots[_getSpotIdFromMessageTokenId],1); // an upvote earns the spot owner 1 famecoin
       return _spotMessages[messageTokenId];

    }

    function upvoteMessage(uint128 messageTokenId) public 
    {
        require(_fameWallet[_msgSender()] > 0);
        require(_spotMessages[messageTokenId] != '');
        _fameWallet[_msgSender()]--;
        _voteWallet[messageTokenId]++;

        _addFameCoin(_messageCreators[messageTokenId],((uint16)(_voteWallet[messageTokenId] / 10)) + 1); // an upvote earns you 1 famecoins and the amount of upvotes divided by ten
        _addFameCoin(_claimedSpots[_getSpotIdFromMessageTokenId],1); // an upvote earns the spot owner 1 famecoin
       return _spotMessages[messageTokenId];

    }

    function convertFameToMessageCoin(uint32 longitude, uint32 latitude) public
    {
        //for now, non-claimed spots can have messagecoins, that means you would be able to create messages for it whenever it exists
        uint64 spotId = _getSpotIdForCoordinates(longitude, latitude);
        _convertFameToMessageCoin(spotId);
    }
    
    function _convertFameToMessageCoin(uint64 spotId) internal
    {
        uint16 cost = 20 + (uint16)(_spotMessages[spotId].length / 10);
        require(_fameWallet[_msgSender()] >= cost);

        _fameWallet[_msgSender()]-= cost;  // means, 2 messages in this spot cost nothing extra, 20 will cost 2 extra, 100 will cost 10 extra
        _spotWallet[spotId][_msgSender()]++;
    }

    function _getSpotIdFromMessageTokenId(uint128 messageTokenId) internal returns(uint64)
    {
        return messageTokenId / _maxMessageTokenPerSpot;
    }

     function _addFameCoin(address receiver,uint16 amt) internal
     {
        _fameWallet[receiver]+=amt;
     }


    function getMessageCoinBalanceForSpot(uint64 spotId) public view returns (uint16)
    {
    return _getMessageCoinBalanceForSpot(spotId);
    }

    function getFameCoinBalance() public view returns (uint16)
    {
        return _fameWallet[_msgSender()];
    }


    function _mintMessageOnSpot(uint64 spotId, string memory message, bool autoConvertFame) internal
    {
        if(autoConvertFame == true && _getMessageCoinBalanceForSpot(spotId) == 0)
        {
            _convertFameToMessageCoin(spotId);
        }

        require(_getMessageCoinBalanceForSpot(spotId)>0);
        
        uint256 messageTokenId = (_spotMessages.length) + spotId * _maxMessageTokenPerSpot; 
        _spotMessages[spotId].push(message) = message;
        _voteWallet[messageTokenId]=0;
        _spotWallet[spotId][_msgSender()]--;
        _messageCreators[messageTokenId] = _msgSender();
        emit MintedMessage(_msgSender(),spotId, messageTokenId);
    }



    function _getMessageCoinBalanceForSpot(uint64 spotId) returns (uint16)
    {
        return _spotWallet[spotId][_msgSender()];
    }

    

    modifier onlyTokenHolder(uint256 tokenId)
    {
        require(_exists(tokenId),'The provided token does not exist');

        require(_owners[getTokenIdIndex(tokenId)] == _msgSender(),"Caller is not owner of the token.");
        _;
    }
    
    
    
    function getTokenIdIndex(uint tokenId) internal view returns (uint256){
        return tokenId - getTypeIdFromTokenId(tokenId) * _maxMessageTokenPerSpot;
    }

    
    function getTypeIdFromTokenId(uint tokenId) internal view returns (uint32){
        return  uint32(tokenId /_maxMessageTokenPerSpot);
    }


    //ERC721 #################################
    

    function totalSupply() public view returns (uint256) {
        return _owners.length;
    }

    
    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC165, IERC165)
        returns (bool)
    {
        return
            interfaceId == type(IERC721).interfaceId ||
            interfaceId == type(IERC721Metadata).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    /**
     * @dev See {IERC721-balanceOf}.
     */
    function balanceOf( address owner)
        public
        view
        virtual
        override
        returns (uint256)
    {
        require(
            owner != address(0),
            "ERC721: balance query for the zero address"
        );

        uint256 amt = 0;
        for (uint256 i = 0; i < _owners.length; i++) {
            if (_owners[i] == owner) {
                amt++;
            }
        }
        return amt;
    }

    /**
     * @dev See {IERC721-ownerOf}.
     */
    function ownerOf(uint256 tokenId)
        public
        view
        virtual
        override
        returns (address)
    {
        address owner = _owners[getTokenIdIndex(tokenId)];
        require(
            owner != address(0),
            "ERC721: owner query for nonexistent token"
        );
        return owner;
    }

    /**
     * @dev See {IERC721Metadata-name}.
     */
    function name() public view virtual override returns (string memory) {
        return _name;
    }

    /**
     * @dev See {IERC721Metadata-symbol}.
     */
    function symbol() public view virtual override returns (string memory) {
        return _symbol;
    }

    /**
     * @dev See {IERC721Metadata-tokenURI}.
     */
    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        require(
            _exists(tokenId),
            "ERC721Metadata: URI query for nonexistent token"
        );

        string memory baseURI = _baseURI();
        return
            bytes(baseURI).length > 0
                ? string(abi.encodePacked(baseURI, tokenId.toString(),".json"))
                : "";
    }

    /**
     * @dev Base URI for computing {tokenURI}. If set, the resulting URI for each
     * token will be the concatenation of the `baseURI` and the `tokenId`. Empty
     * by default, can be overriden in child contracts.
     */
    function _baseURI() internal view virtual returns (string memory) {
        return _baseURL;
    }

    

    /**
     * @dev See {IERC721-approve}.
     */
    function approve(address to, uint256 tokenId) public virtual override {
        address owner = GeoFingerToken.ownerOf(tokenId);
        require(to != owner, "ERC721: approval to current owner");

        require(
            _msgSender() == owner || isApprovedForAll(owner, _msgSender()),
            "ERC721: approve caller is not owner nor approved for all"
        );

        _approve(to, tokenId);
    }

    /**
     * @dev See {IERC721-getApproved}.
     */
    function getApproved(uint256 tokenId)
        public
        view
        virtual
        override
        returns (address)
    {
        require(
            _exists(tokenId),
            "ERC721: approved query for nonexistent token"
        );

        return _tokenApprovals[getTokenIdIndex(tokenId)];
    }

    /**
     * @dev See {IERC721-setApprovalForAll}.
     */
    function setApprovalForAll(address operator, bool approved)
        public
        virtual
        override
    {
        _setApprovalForAll(_msgSender(), operator, approved);
    }

    /**
     * @dev See {IERC721-isApprovedForAll}.
     */
    function isApprovedForAll(address owner, address operator)
        public
        view
        virtual
        override
        returns (bool)
    {
        return _operatorApprovals[owner][operator];
    } 

    /**
     * @dev See {IERC721-transferFrom}.
     */
    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public virtual override {
        //solhint-disable-next-line max-line-length
        require(
            _isApprovedOrOwner(_msgSender(), tokenId),
            "ERC721: transfer caller is not owner nor approved"
        );

        _transfer(from, to, tokenId);
    }

    /**
     * @dev See {IERC721-safeTransferFrom}.
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public virtual override {
        safeTransferFrom(from, to, tokenId, "");
    }

    /**
     * @dev See {IERC721-safeTransferFrom}.
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory _data
    ) public virtual override {
        require(
            _isApprovedOrOwner(_msgSender(), tokenId),
            "ERC721: transfer caller is not owner nor approved"
        );
        _safeTransfer(from, to, tokenId, _data);
    }

    /**
     * @dev Safely transfers `tokenId` token from `from` to `to`, checking first that contract recipients
     * are aware of the ERC721 protocol to prevent tokens from being forever locked.
     *
     * `_data` is additional data, it has no specified format and it is sent in call to `to`.
     *
     * This internal function is equivalent to {safeTransferFrom}, and can be used to e.g.
     * implement alternative mechanisms to perform token transfer, such as signature-based.
     *
     * Requirements:
     *
     * - `from` cannot be the zero address.
     * - `to` cannot be the zero address.
     * - `tokenId` token must exist and be owned by `from`.
     * - If `to` refers to a smart contract, it must implement {IERC721Receiver-onERC721Received}, which is called upon a safe transfer.
     *
     * Emits a {Transfer} event.
     */
    function _safeTransfer(
        address from,
        address to,
        uint256 tokenId,
        bytes memory _data
    ) internal virtual {
        _transfer(from, to, tokenId);
        require(
            _checkOnERC721Received(from, to, tokenId, _data),
            "ERC721: transfer to non ERC721Receiver implementer"
        );
    }

    /**
     * @dev Returns whether `tokenId` exists.
     *
     * Tokens can be managed by their owner or approved accounts via {approve} or {setApprovalForAll}.
     *
     * Tokens start existing when they are minted (`_mint`),
     * and stop existing when they are burned (`_burn`).
     */
    function _exists(uint256 tokenId) internal view virtual returns (bool) {
        return _owners.length < getTokenIdIndex( tokenId); //owner length is the amt of existing tokens, including burned tokens
    }

    /**
     * @dev Returns whether `spender` is allowed to manage `tokenId`.
     *
     * Requirements:
     *
     * - `tokenId` must exist.
     */
    function _isApprovedOrOwner(address spender, uint256 tokenId)
        internal
        view
        virtual
        returns (bool)
    {
        require(
            _exists(tokenId),
            "ERC721: operator query for nonexistent token"
        );
        address owner = GeoFingerToken.ownerOf(tokenId);
        return (spender == owner ||
            getApproved(tokenId) == spender ||
            isApprovedForAll(owner, spender));
    }

    /**
     * @dev Safely mints `tokenId` and transfers it to `to`.
     *
     * Requirements:
     *
     * - `tokenId` must not exist.
     * - If `to` refers to a smart contract, it must implement {IERC721Receiver-onERC721Received}, which is called upon a safe transfer.
     *
     * Emits a {Transfer} event.
     */
    function _safeMint(address to, uint256 tokenId) internal virtual {
        _safeMint(to, tokenId, "");
    }

    /**
     * @dev Same as {xref-ERC721-_safeMint-address-uint256-}[`_safeMint`], with an additional `data` parameter which is
     * forwarded in {IERC721Receiver-onERC721Received} to contract recipients.
     */
    function _safeMint(
        address to,
        uint256 tokenId,
        bytes memory _data
    ) internal virtual {
        _mint(to, tokenId);
        require(
            _checkOnERC721Received(address(0), to, tokenId, _data),
            "ERC721: transfer to non ERC721Receiver implementer"
        );
    }

    

    /**
     * @dev Mints `tokenId` and transfers it to `to`.
     *
     * WARNING: Usage of this method is discouraged, use {_safeMint} whenever possible
     *
     * Requirements:
     *
     * - `tokenId` must not exist.
     * - `to` cannot be the zero address.
     *
     * Emits a {Transfer} event.
     */
    function _mint(address to, uint256 tokenId) internal virtual {
        require(to != address(0), "ERC721: mint to the zero address");
        require(!_exists(tokenId), "ERC721: token already minted");

        _beforeTokenTransfer(address(0), to, tokenId);
        uint32 ttype = uint32(tokenId / _maxMessageTokenPerSpot);
        _owners.push(to);

        emit Transfer(address(0), to, tokenId);
    }


    /**
     * @dev Destroys `tokenId`.
     * The approval is cleared when the token is burned.
     *
     * Requirements:
     *
     * - `tokenId` must exist.
     *
     * Emits a {Transfer} event.
     */
    function _burn(uint256 tokenId) internal virtual {
        address owner = GeoFingerToken.ownerOf(tokenId);

        _beforeTokenTransfer(owner, address(0), tokenId);

        // Clear approvals
        _approve(address(0), tokenId);

        _owners[tokenId] = address(0);

        emit Transfer(owner, address(0), tokenId);
    }

    /**
     * @dev Transfers `tokenId` from `from` to `to`.
     *  As opposed to {transferFrom}, this imposes no restrictions on msg.sender.
     *
     * Requirements:
     *
     * - `to` cannot be the zero address.
     * - `tokenId` token must be owned by `from`.
     *
     * Emits a {Transfer} event.
     */
    function _transfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual {
        require(
            GeoFingerToken.ownerOf(tokenId) == from,
            "ERC721: transfer of token that is not own"
        );
        require(to != address(0), "ERC721: transfer to the zero address");

        _beforeTokenTransfer(from, to, tokenId);

        // Clear approvals from the previous owner
        _approve(address(0), tokenId);

        _owners[tokenId] = to;

        emit Transfer(from, to, tokenId);
    }

    /**
     * @dev Approve `to` to operate on `tokenId`
     *
     * Emits a {Approval} event.
     */
    function _approve(address to, uint256 tokenId) internal virtual {
        _tokenApprovals[tokenId] = to;
        emit Approval(GeoFingerToken.ownerOf(tokenId), to, tokenId);
    }

    /**
     * @dev Approve `operator` to operate on all of `owner` tokens
     *
     * Emits a {ApprovalForAll} event.
     */
    function _setApprovalForAll(
        address owner,
        address operator,
        bool approved
    ) internal virtual {
        require(owner != operator, "ERC721: approve to caller");
        _operatorApprovals[owner][operator] = approved;
        emit ApprovalForAll(owner, operator, approved);
    }

    /**
     * @dev Internal function to invoke {IERC721Receiver-onERC721Received} on a target address.
     * The call is not executed if the target address is not a contract.
     *
     * @param from address representing the previous owner of the given token ID
     * @param to target address that will receive the tokens
     * @param tokenId uint256 ID of the token to be transferred
     * @param _data bytes optional data to send along with the call
     * @return bool whether the call correctly returned the expected magic value
     */
    function _checkOnERC721Received(
        address from,
        address to,
        uint256 tokenId,
        bytes memory _data
    ) private returns (bool) {
        if (to.isContract()) {
            try
                IERC721Receiver(to).onERC721Received(
                    _msgSender(),
                    from,
                    tokenId,
                    _data
                )
            returns (bytes4 retval) {
                return retval == IERC721Receiver.onERC721Received.selector;
            } catch (bytes memory reason) {
                if (reason.length == 0) {
                    revert(
                        "ERC721: transfer to non ERC721Receiver implementer"
                    );
                } else {
                    assembly {
                        revert(add(32, reason), mload(reason))
                    }
                }
            }
        } else {
            return true;
        }
    }

    /**
     * @dev Hook that is called before any token transfer. This includes minting
     * and burning.
     *
     * Calling conditions:
     *
     * - When `from` and `to` are both non-zero, ``from``'s `tokenId` will be
     * transferred to `to`.
     * - When `from` is zero, `tokenId` will be minted for `to`.
     * - When `to` is zero, ``from``'s `tokenId` will be burned.
     * - `from` and `to` are never both zero.
     *
     * To learn more about hooks, head to xref:ROOT:extending-contracts.adoc#using-hooks[Using Hooks].
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual {}

}
