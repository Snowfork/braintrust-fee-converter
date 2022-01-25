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
  const slipInPerc = new web3.utils.BN(100 - slippage);
  const amountOutMin = estimatedAmountOut.mul(slipInPerc).div(new web3.utils.BN(100));

  return { amountOutMin, amountInBN };
};

export const makeCancelable = (promise) => {
  let hasCanceled_ = false;

  const wrappedPromise = new Promise((resolve, reject) => {
    promise.then(
      val => hasCanceled_ ? reject({ isCanceled: true }) : resolve(val),
      error => hasCanceled_ ? reject({ isCanceled: true }) : reject(error)
    );
  });

  return {
    promise: wrappedPromise,
    cancel() {
      hasCanceled_ = true;
    },
  };
};
