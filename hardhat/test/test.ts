import { BaseProvider } from "@ethersproject/providers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { use, expect } from "chai";
import { solidity } from "ethereum-waffle";
import { Contract } from "ethers";
import { ethers, artifacts } from "hardhat";
import Web3 from "Web3";

use(solidity);

describe("My Dapp", function () {
  describe("Fee Converter", function () {
    it("Should return the expected converted amount", async function () {
      const web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8545"));
      const uint256 = Number(web3.utils.numberToHex((2 ^ 256) - 1));

      // Addresses
      const CONTRACT_ADDRESS = "0x67A238E1aC273B15581AFBC806A4FA9Ba2eaF7Dc";
      const USDC_ADDRESS = "0x4dbcdf9b62e891a7cec5a2568c3f4faf9e8abe2b";

      // ABIs
      const CONTRACT_ABI = require("./contract_abi.json");
      const USDC_ABI = require("./abi.json");

      // Contracts
      const USDC_CONTRACT = new web3.eth.Contract(USDC_ABI, USDC_ADDRESS);
      const CONVERTER_CONTRACT = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);

      // Retrieve user accounts
      const owners = await web3.eth.getAccounts();

      // send funds to allowance / approve
      await USDC_CONTRACT.methods.approve(CONTRACT_ADDRESS, uint256 * Math.pow(10, 6)).send({ from: owners[0] });
      const userBalance = await USDC_CONTRACT.methods.balanceOf(owners[0]).call();
      // const cont_balance = await USDC_CONTRACT.methods.balanceOf(CONTRACT_ADDRESS).call();
      const allowance = await USDC_CONTRACT.methods.allowance(owners[0], CONTRACT_ADDRESS).call();
      console.log(userBalance, allowance);

      // something wrong here
      const amount = 1;
      const amountOut = await CONVERTER_CONTRACT.methods
        .swapExactInputSingle(`${amount * Math.pow(10, 6)}`)
        .send({ from: owners[0] });
      console.log(amountOut);
    });
  });
});
