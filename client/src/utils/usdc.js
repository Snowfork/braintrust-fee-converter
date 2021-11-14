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

  // TODO: Replace hardcoded decimal points with token decimal
  const balance = (await getBalance(contract, accounts[0])) * Math.pow(10, 6);
  const convertedValue = value * Math.pow(10, 6);

  if (!balance || balance < convertedValue) {
    const max = new web3.utils.BN("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff")
      .sub(new web3.utils.BN(1))
      .toString();
    // TODO: Replace hardcoded decimal points with token decimal
    await contract.methods.approve(CONTRACT_ADDRESS, max).send({ from: accounts[0] });
  }
};

export const getBalance = async (contract, account) => {
  return await contract.methods.allowance(account, CONTRACT_ADDRESS).call();
};
