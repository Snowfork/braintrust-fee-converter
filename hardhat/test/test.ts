import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { use, expect } from "chai";
import { solidity } from "ethereum-waffle";
import { Contract } from "ethers";
import { ethers, artifacts } from "hardhat";

use(solidity);

describe("My Dapp", function () {
  let BTRSTToken: Contract;
  let owner: SignerWithAddress;
  let address1: SignerWithAddress;
  let address2: SignerWithAddress;

  // quick fix to let gas reporter fetch data from gas station & coinmarketcap
  beforeEach(async function () {
    const BTRST = await ethers.getContractFactory("BTRST");
    [owner, address1, address2] = await ethers.getSigners();
    const BTRSTToken = await BTRST.deploy(owner.address);
    await BTRSTToken.deployed();
  });

  describe("Deployment", function () {
    it("Should deploy to rinkeby testnet", async function () {
      const result = await BTRSTToken.provider.getNetwork.name;
      expect(result).to.equal("rinkeby");
    });

    it("Should assign the total supply of tokens to the owner", async function () {
      const ownerBalance = await BTRSTToken.balanceOf(owner.address);
      expect(await BTRSTToken.totalSupply()).to.equal(ownerBalance);
    });
  });

  describe("Transactions", function () {
    it("Should transfer tokens between accounts", async function () {
      await BTRSTToken.transfer(address1.address, 50);
      const address1Balance = await BTRSTToken.balanceOf(address1.address);
      expect(address1Balance).to.equal(50);

      await BTRSTToken.transferFrom(address1.address, address2.address, 50);
      const address2Balance = await BTRSTToken.balanceOf(address2.address);
      expect(address2Balance).to.equal(50);
    });
  });
});
