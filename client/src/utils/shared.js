import Web3 from "web3";
import { CONTRACT_ABI, USDC_ABI } from "./abi";

const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;
const USDC_ADDRESS = process.env.REACT_APP_USDC_ADDRESS;

export const getERC20Balance = async (contract, address) => {
  return contract.methods.balanceOf(address).call();
};

export const getERC20Allowance = async (contract, owner) => {
  try {
    return contract.methods.allowance(owner, CONTRACT_ADDRESS).call();
  } catch (error) {
    console.error(error.message);
  }
};

export const getERC20Decimal = async (contract) => {
  return await contract.methods.decimals().call();
};

export const getAmountOutMin = async (provider, amount, slippage, quotePrice) => {
  const web3 = new Web3(provider);
  const CONVERTER_CONTRACT = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
  const USDC_CONTRACT = new web3.eth.Contract(USDC_ABI, USDC_ADDRESS);
  const decimals = await getERC20Decimal(USDC_CONTRACT)

  const contractPoolFee = await CONVERTER_CONTRACT.methods.poolFee().call();
  const poolFee = 1 - (contractPoolFee / 1000000);
  const amountReal = new web3.utils.BN(amount * Math.pow(10, decimals));
  const slipInPerc = (100 - slippage) / 100;
  const amountOutMin = new web3.utils.BN(amountReal * quotePrice * slipInPerc * poolFee);

  return { amountOutMin, amountReal };
};
