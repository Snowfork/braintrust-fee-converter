import Web3 from "web3";
import { USDC_ABI } from "./abi";

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

export const getAmountOutMin = async (provider, amountIn, slippage, estimatedAmountOut) => {
  const web3 = new Web3(provider);
  const USDC_CONTRACT = new web3.eth.Contract(USDC_ABI, USDC_ADDRESS);
  const decimals = await getERC20Decimal(USDC_CONTRACT)

  const amountInBN = new web3.utils.BN(amountIn * Math.pow(10, decimals));
  const slipInPerc = (100 - slippage) / 100;
  const amountOutMin = estimatedAmountOut * slipInPerc;

  return { amountOutMin, amountInBN };
};
