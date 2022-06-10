import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class Web3service extends Service.extend({}) {

    _abi = [] //abi comes here
    _web3addr = 'https://yitc.ddns.net:8545';
    _geofinger_contract_address = '0x0000000000000000000000000000000000000000';
    _lweb3 = new Web3(this._web3addr);
    _contract = new this._lweb3.eth.Contract(this._abi, this._geofinger_contract_address);
    _metamask = null;


    @tracked _connectedAccount = null;


    get isConnected() {
        if (window.ethereum == null) return false;

        return (this._connectedAccount || null) != null
    }

    registerHandlers() {
        if (!this.hasWalletEventsSet) {


            window.web3 = new Web3(window.ethereum);
            this._metamask = new window.web3.eth.Contract(this._abi, this._geofinger_contract_address);


            window.ethereum.on("disconnect", (error) => {
                console.debug(`Disconnected from network ${error}`);
                this._connectedAccount = null;
            });

            window.ethereum.on("accountsChanged", (accounts) => {
                if (accounts.length > 0) {
                    this._connectedAccount = window.ethereum.selectedAddress;
                } else {
                    console.error("0 accounts.");
                }
            });
            this.hasWalletEventsSet = true;
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


}
