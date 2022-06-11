const tokenContract = artifacts.require("GeoFingerToken");
const truffleAssertions = require('truffle-assertions');
const truffleAssert = require('truffle-assertions');
const Web3 = require('web3');
const BN = require('bn.js');
let _tokens = [];  
//truffle test
contract('GeoFingerToken: full integration', async (accounts) => {
    const [deployerAddress, tokenHolderOneAddress, tokenHolderTwoAddress] = accounts;
   
    const web3 = config.network==='develop'? new Web3('http://127.0.0.1:9545'):await (async (config)=>{
        throw `config.networks[${config.network}].web3Uri not set in truffle-config.js` 
        return await new Web3(config.networks[config.network].web3Uri); 
    })(config);

    it("should assert true", async function () {
      let token = await tokenContract.deployed();   
      return assert.isTrue(true);
    });
  });