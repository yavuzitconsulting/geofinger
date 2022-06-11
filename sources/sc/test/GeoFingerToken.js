const tokenContract = artifacts.require("GeoFingerToken");
const truffleAssertions = require('truffle-assertions');
const truffleAssert = require('truffle-assertions');
const Web3 = require('web3');
const BN = require('bn.js');
let _tokens = [];  
//truffle test
contract('GeoFingerToken: full integration', async (accounts) => {
    const [deployerAddress, tokenHolderOneAddress, tokenHolderTwoAddress] = accounts;
   
    const web3 = new Web3('http://127.0.0.1:9545'); //truffledevelop
    
    
    it("should assert true", async function () {
      let token = await tokenContract.deployed();   
      return assert.isTrue(true);
    });
  });