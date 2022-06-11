const Token = artifacts.require("GeoFingerToken");

//ngc generate from-abi -abi BasicEvidencingToken.abi -o . -ns CryptNG.Autogen


module.exports = function (deployer) {

   deployer.deploy(Token);
   //config.network contains the current network that the process is started with
   //its magically set by truffle
  // if (config.network == "develop") return;

};




    
  