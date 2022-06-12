import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class Web3service extends Service.extend({}) {

    _abi =  [
        {
          "inputs": [],
          "stateMutability": "nonpayable",
          "type": "constructor"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "address",
              "name": "owner",
              "type": "address"
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "approved",
              "type": "address"
            },
            {
              "indexed": true,
              "internalType": "uint256",
              "name": "tokenId",
              "type": "uint256"
            }
          ],
          "name": "Approval",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "address",
              "name": "owner",
              "type": "address"
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "operator",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "bool",
              "name": "approved",
              "type": "bool"
            }
          ],
          "name": "ApprovalForAll",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": false,
              "internalType": "address",
              "name": "sender",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "address",
              "name": "addressToAllow",
              "type": "address"
            }
          ],
          "name": "AssignedAllowedServiceEvent",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": false,
              "internalType": "address",
              "name": "creator",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "fromHash",
              "type": "uint256"
            },
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "toHash",
              "type": "uint256"
            },
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "tokenId",
              "type": "uint256"
            }
          ],
          "name": "MintedHashMapEvidence",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": false,
              "internalType": "address",
              "name": "sender",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "uint64",
              "name": "spotId",
              "type": "uint64"
            },
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "messageTokenId",
              "type": "uint256"
            }
          ],
          "name": "MintedMessage",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "address",
              "name": "previousOwner",
              "type": "address"
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "newOwner",
              "type": "address"
            }
          ],
          "name": "OwnershipTransferred",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": false,
              "internalType": "address",
              "name": "sender",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "tokenId",
              "type": "uint256"
            },
            {
              "indexed": false,
              "internalType": "uint64",
              "name": "spotId",
              "type": "uint64"
            }
          ],
          "name": "SpotClaimed",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "address",
              "name": "from",
              "type": "address"
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "to",
              "type": "address"
            },
            {
              "indexed": true,
              "internalType": "uint256",
              "name": "tokenId",
              "type": "uint256"
            }
          ],
          "name": "Transfer",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": false,
              "internalType": "address",
              "name": "sender",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "address",
              "name": "addressToUnassign",
              "type": "address"
            }
          ],
          "name": "UnassignedAllowedServiceEvent",
          "type": "event"
        },
        {
          "inputs": [],
          "name": "owner",
          "outputs": [
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "renounceOwnership",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "newOwner",
              "type": "address"
            }
          ],
          "name": "transferOwnership",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "string",
              "name": "uri",
              "type": "string"
            }
          ],
          "name": "setBaseURI",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "getIsMintingActive",
          "outputs": [
            {
              "internalType": "bool",
              "name": "",
              "type": "bool"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "setIsMintingActive",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "setIsMintingInactive",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "string",
              "name": "uniCodeMessage",
              "type": "string"
            },
            {
              "internalType": "uint32",
              "name": "longitude",
              "type": "uint32"
            },
            {
              "internalType": "uint32",
              "name": "latitude",
              "type": "uint32"
            },
            {
              "internalType": "bool",
              "name": "autoConvertFame",
              "type": "bool"
            }
          ],
          "name": "mintMessage",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "uint32",
              "name": "longitude",
              "type": "uint32"
            },
            {
              "internalType": "uint32",
              "name": "latitude",
              "type": "uint32"
            }
          ],
          "name": "getTeasedMessagesForSpot",
          "outputs": [
            {
              "components": [
                {
                  "internalType": "string",
                  "name": "message",
                  "type": "string"
                },
                {
                  "internalType": "uint128",
                  "name": "tokenId",
                  "type": "uint128"
                }
              ],
              "internalType": "struct GeoFingerToken.MessageContainer[]",
              "name": "",
              "type": "tuple[]"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "uint128",
              "name": "messageTokenId",
              "type": "uint128"
            }
          ],
          "name": "unlockMessage",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "uint128",
              "name": "messageTokenId",
              "type": "uint128"
            }
          ],
          "name": "getUnlockedMessage",
          "outputs": [
            {
              "internalType": "string",
              "name": "",
              "type": "string"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "uint128",
              "name": "messageTokenId",
              "type": "uint128"
            }
          ],
          "name": "upvoteMessage",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "uint32",
              "name": "longitude",
              "type": "uint32"
            },
            {
              "internalType": "uint32",
              "name": "latitude",
              "type": "uint32"
            }
          ],
          "name": "convertFameToMessageCoin",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "uint32",
              "name": "longitude",
              "type": "uint32"
            },
            {
              "internalType": "uint32",
              "name": "latitude",
              "type": "uint32"
            }
          ],
          "name": "getMessageCoinBalanceForSpot",
          "outputs": [
            {
              "internalType": "uint16",
              "name": "",
              "type": "uint16"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "getFameCoinBalance",
          "outputs": [
            {
              "internalType": "uint16",
              "name": "",
              "type": "uint16"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "string",
              "name": "str",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "startIndex",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "endIndex",
              "type": "uint256"
            }
          ],
          "name": "_substring",
          "outputs": [
            {
              "internalType": "string",
              "name": "",
              "type": "string"
            }
          ],
          "stateMutability": "pure",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "totalSupply",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "bytes4",
              "name": "interfaceId",
              "type": "bytes4"
            }
          ],
          "name": "supportsInterface",
          "outputs": [
            {
              "internalType": "bool",
              "name": "",
              "type": "bool"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "owner",
              "type": "address"
            }
          ],
          "name": "balanceOf",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "tokenId",
              "type": "uint256"
            }
          ],
          "name": "ownerOf",
          "outputs": [
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "name",
          "outputs": [
            {
              "internalType": "string",
              "name": "",
              "type": "string"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "symbol",
          "outputs": [
            {
              "internalType": "string",
              "name": "",
              "type": "string"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "tokenId",
              "type": "uint256"
            }
          ],
          "name": "tokenURI",
          "outputs": [
            {
              "internalType": "string",
              "name": "",
              "type": "string"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "to",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "tokenId",
              "type": "uint256"
            }
          ],
          "name": "approve",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "tokenId",
              "type": "uint256"
            }
          ],
          "name": "getApproved",
          "outputs": [
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "operator",
              "type": "address"
            },
            {
              "internalType": "bool",
              "name": "approved",
              "type": "bool"
            }
          ],
          "name": "setApprovalForAll",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "owner",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "operator",
              "type": "address"
            }
          ],
          "name": "isApprovedForAll",
          "outputs": [
            {
              "internalType": "bool",
              "name": "",
              "type": "bool"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "from",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "to",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "tokenId",
              "type": "uint256"
            }
          ],
          "name": "transferFrom",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "from",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "to",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "tokenId",
              "type": "uint256"
            }
          ],
          "name": "safeTransferFrom",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "from",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "to",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "tokenId",
              "type": "uint256"
            },
            {
              "internalType": "bytes",
              "name": "_data",
              "type": "bytes"
            }
          ],
          "name": "safeTransferFrom",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        }
      ] //abi goes here
    _web3addr = 'https://yitc.ddns.net:8545';
    _geofinger_contract_address = '0x0000000000000000000000000000000000000000';
    _lweb3 = new Web3(this._web3addr);
    _contract = new this._lweb3.eth.Contract(this._abi, this._geofinger_contract_address);
    _metamask = null;
    @tracked _isMintingActive = false;


    @tracked _connectedAccount = null;


    get isConnected() {
        if (window.ethereum == null) return false;

        return (this._connectedAccount || null) != null
    }

    registerHandlers(router) {
        if (!this.hasWalletEventsSet) {
            console.debug('registering web3 handlers');

            window.web3 = new Web3(window.ethereum);
            this._metamask = new window.web3.eth.Contract(this._abi, this._geofinger_contract_address);


            window.ethereum.on("disconnect", (error) => {
                console.log(`Disconnected from network ${error}`);
               router.transitionTo('/');
              });
        
              window.ethereum.on("accountsChanged", (accounts) => {
                if (accounts.length > 0) {
                   router.transitionTo('/');
                } else {
                  console.error("0 accounts.");
                  router.transitionTo('/');
                }
              });
              this.hasWalletEventsSet = true;
            }
           
        
            if((window.ethereum.selectedAddress || null) != null)
            {
             router.transitionTo('/');
            }
    }

    async connect() {

        if (window.ethereum) {
            window.ethereum.on("chainChanged", () => window.location.reload());


            await window.ethereum.request({ method: 'eth_requestAccounts' })[0];



            window.ethereum.on("message", (message) => console.debug(message));

            window.ethereum.on("connect", (info) => {
                console.debug(`Connected to network ${info}`);
                this._connectedAccount = window.ethereum.selectedAddress;
            });

            window.ethereum.on("disconnect", (error) => {
                console.debug(`Disconnected from network ${error}`);
                this._connectedAccount = null;
            });

            console.debug('connected');

        } else {
            console.error("Install MetaMask.");
        }

    }

    async getContractBalance() {
        let res = await this._contract.methods.balanceOf(this._connectedAccount).call({ from: this._connectedAccount });
        console.debug('The Balance of ' + this._connectedAccount + 'is ' + res);
        return res;
    }

    @action async mintAsync() {
        if (window.ethereum) {
            console.debug('ACC:' + window.ethereum.selectedAddress);


            let currentGasPrice = this._lweb3.utils.numberToHex(await this._lweb3.eth.getGasPrice());
            console.debug('currentGasPrice: ' + currentGasPrice);
            let estimatedGasSpending = this._lweb3.utils.numberToHex(await this._contract.methods.mint(1, this._connectedAccount).estimateGas({ from: window.ethereum.selectedAddress }));
            console.debug('estimatedGasSpending: ' + estimatedGasSpending);
            console.debug('ETH-ADDRESS: ' + this._connectedAccount);


            await this._metamask.methods.mint(1, this._connectedAccount).send({ from: this._connectedAccount })
                .on('transactionHash', function (hash) {
                    console.debug('transactionhash: ' + hash);
                })
                .on('confirmation', function (confirmationNumber, receipt) {

                    console.debug('confirmation no: ' + confirmationNumber);
                })
                .on('receipt', function (receipt) {
                    // receipt example
                    console.debug('receipt: ' + receipt);

                })
                .on('error', function (error, receipt) { // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
                    console.debug('error: ' + error);
                });
        } else {
            this.connect();
            console.debug('ERROR, NOT CONNECTED. RETRYING');
            this.mint();
        }
    }

    
  async getIsMintingActive()
  {
    // let this.lweb3 = new Web3('http://127.0.0.1:9545');
    

    console.debug('asking contract if minting is active');
    

    let res = await this._contract.methods.getIsMintingActive();
    console.debug('result: ' + res);
    this._isMintingActive = res;
  }



}
