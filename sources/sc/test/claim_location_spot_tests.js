const ClaimLocationSpotTests = artifacts.require("ClaimLocationSpotTests");

/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
contract("ClaimLocationSpotTests", function (/* accounts */) {
  it("should assert true", async function () {
    await ClaimLocationSpotTests.deployed();
    return assert.isTrue(true);
  });
});
