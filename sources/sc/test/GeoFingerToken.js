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

    

    it('disallows anybody but owner to disable minting', async () => {
      let token = await tokenContract.deployed();       
     
      await truffleAssertions.reverts(token.setIsMintingActive({from: accounts[1]}),"Ownable: caller is not the owner");
 
  });
  

  it('disallows anybody but owner to enable minting', async () => {
    let token = await tokenContract.deployed();       
   
    await truffleAssertions.reverts(token.setIsMintingInactive({from: accounts[1]}),"Ownable: caller is not the owner");

});
         
    it("should allow the contract owner to disable minting", async function () {
      let token = await tokenContract.deployed();       
     
      await truffleAssertions.passes(token.setIsMintingInactive({from: accounts[0]}));
    });

    it("should allow anyone to retrieve the information if minting is active", async function () {
      let token = await tokenContract.deployed();   
      let mintingActive = await token.getIsMintingInactive({from: accounts[0]});
      
      return assert.isFalse(mintingActive);
    });


    it("should allow the contract owner to enable minting", async function () {
      let token = await tokenContract.deployed();   
      await truffleAssertions.passes(token.setIsMintingActive({from: accounts[0]}));
    });

    
    it("should allow to mint a message in a previously unclaimed spot", async function () {
      /*
        mintMessage(
        string memory uniCodeMessage,
        uint32 longitude,
        uint32 latitude,
        bool autoConvertFame
    )
      */
      let token = await tokenContract.deployed();   
      await truffleAssertions.passes(token.mint('test-message',51.5555555,8.8888888, false,{from:accounts[1], value: value}), 'mint failed');
    });

    
    
    it("should allow to mint a message in a previously unclaimed spot and automatically convert some of the generated fame into messagecoins", async function () {
      /*
        mintMessage(
        string memory uniCodeMessage,
        uint32 longitude,
        uint32 latitude,
        bool autoConvertFame
    )
      */
      let token = await tokenContract.deployed();   
      await truffleAssertions.passes(token.mint('test-message',52.5555555,9.8888888, true,{from:accounts[1], value: value}), 'mint failed');
    });


    it("should allow to retrieve the balance of messagecoins for a previously claimed spot", async function () {
      /*
getMessageCoinBalanceForSpot(uint32 longitude, uint32 latitude)
    )
      */
      let token = await tokenContract.deployed();   
      let balance = await token.getMessageCoinBalanceForSpot(51.5555555,8.8888888);
      return assert.isTrue(balance > 0);
    });

    
    it("should allow to mint a message in a previously claimed spot", async function () {
      /*
 mintMessage(
        string memory uniCodeMessage,
        uint32 longitude,
        uint32 latitude,
        bool autoConvertFame
    )
      */
      let token = await tokenContract.deployed();   
      await truffleAssertions.passes(token.mint('test-message',52.5555555,9.8888888, true,{from:accounts[1], value: value}), 'mint failed');
    });

      
    it("should allow to retrieve a teaser for all messages in a claimed spot", async function () {
      /*
getTeasedMessagesForSpot(uint32 longitude, uint32 latitude)
      */
      let token = await tokenContract.deployed();   
      let teasedMessages = await token.getTeasedMessagesForSpot(52.5555555,9.8888888);
      return assert.isTrue(teasedMessages.length > 1);
    });

    
      
    it("should allow to retrieve a specific selected message from a teased message", async function () {
      /*
readMessage(uint128 messageTokenId)
      */
      let token = await tokenContract.deployed();   
      let teasedMessages = await token.getTeasedMessagesForSpot(52.5555555,9.8888888);
      let length = teasedMessages[0].length;
      assert.isTrue(length > 0);
      let fullmessage = await token.readMessage(teasedMessages[0].tokenId);
      assert.isTrue(fullmessage.length > length);
    });

        
      
    it("should allow to upvote a specific selected message from a teased message", async function () {
      /*
upvoteMessage(uint128 messageTokenId)
      */
      let token = await tokenContract.deployed();   
      let teasedMessages = await token.getTeasedMessagesForSpot(52.5555555,9.8888888);
      await truffleAssertions.passes(token.upvoteMessage(teasedMessages[0].tokenId));
    });

          
    it("should allow to convert fame into message tokens for a specific spot", async function () {
      /*
convertFameToMessageCoin(uint32 longitude, uint32 latitude)
      */
      let token = await tokenContract.deployed();   
      await truffleAssertions.passes(token.convertFameToMessageCoin(52.5555555,9.8888888));
    });

              
    it("should allow to view the fame balance of own wallet", async function () {
      /*
getFameCoinBalance()
      */
      let token = await tokenContract.deployed();   
      let balance = await token.getFameCoinBalance();
      return assert.isTrue(balance > 0);
    });


  });