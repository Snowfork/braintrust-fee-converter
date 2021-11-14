import Web3 from "web3";
import { use, expect } from "chai";
import { solidity } from "ethereum-waffle";

use(solidity);

describe("Brain Trust Fee Converter", function () {
  it("Should successfully swap and send", async function () {
    const web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8545"));
    const max = web3.utils
      .toBN("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff")
      .sub(web3.utils.toBN(1));

    // Addresses
    const CONTRACT_ADDRESS = "0x3E0a0ed88934Ee36113e8187d3635C24dA01e1E4";
    const USDC_ADDRESS = "0x4dbcdf9b62e891a7cec5a2568c3f4faf9e8abe2b";

    // ABIs
    const CONTRACT_ABI = require("./contract_abi.json");
    const USDC_ABI = require("./abi.json");

    // Contracts
    const USDC_CONTRACT = new web3.eth.Contract(USDC_ABI, USDC_ADDRESS);
    const CONVERTER_CONTRACT = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);

    // Retrieve user accounts
    const owners = await web3.eth.getAccounts();

    // Send funds to approve
    await USDC_CONTRACT.methods.approve(CONTRACT_ADDRESS, max).send({ from: owners[0] });
    const allowance = await USDC_CONTRACT.methods.allowance(owners[0], CONTRACT_ADDRESS).call();

    const amount = `${10 * Math.pow(10, 6)}`;
    const amountOut = await CONVERTER_CONTRACT.methods.swapExactInputSingle(amount).send({ from: owners[0] });

    expect(allowance).to.equal(max.toString());
    expect(amountOut.status).to.equal(true);
  });
});
