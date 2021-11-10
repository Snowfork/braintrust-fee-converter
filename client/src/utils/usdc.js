import Web3 from "web3";
import { USDC_ABI } from "./abi";

const USDC_ADDRESS = process.env.REACT_APP_USDC_ADDRESS;
const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;

export const getUSDCBalance = async (walletAddress, provider) => {
  const web3 = new Web3(provider);
  const contract = new web3.eth.Contract(USDC_ABI, USDC_ADDRESS);
  const balance = await contract.methods.balanceOf(walletAddress).call();
  const decimals = await contract.methods.decimals().call();
  const convertedBalance = balance / Math.pow(10, decimals);
  return convertedBalance;
};

export const approveUSDC = async (provider, value) => {
  const web3 = new Web3(provider);
  const contract = new web3.eth.Contract(USDC_ABI, USDC_ADDRESS);
  const accounts = await provider.request({
    method: "eth_requestAccounts",
  });

  const balance = await getBalance(contract, accounts[0]);
  console.log(`Max value approved: ${balance} USDC`);

  if (!balance || balance < value) {
    // const uint256 = web3.utils.numberToHex(2 ^ (256 - 1));
    await contract.methods
      .approve(CONTRACT_ADDRESS, 100)
      .send({ from: accounts[0] });
  }
};

export const getBalance = async (contract, account) => {
  return await contract.methods.allowance(account, CONTRACT_ADDRESS).call();
};
