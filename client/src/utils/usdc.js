import Web3 from "web3";
import { USDC_ABI } from "./abi";
import { getERC20Balance, getERC20Decimal } from "./shared";

const USDC_ADDRESS = process.env.REACT_APP_USDC_ADDRESS;
const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;
const uint256_MAX = "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";

export const getUSDCBalance = async (walletAddress, provider) => {
  try {
    const web3 = new Web3(provider);
    const USDC_CONTRACT = new web3.eth.Contract(USDC_ABI, USDC_ADDRESS);

    const [balance, decimals] = await Promise.all([
      getERC20Balance(USDC_CONTRACT, walletAddress),
      getERC20Decimal(USDC_CONTRACT),
    ]);

    const convertedBalance = balance / Math.pow(10, decimals);
    return convertedBalance;
  } catch (error) {
    console.error(error.message);
  }
};

export const approveUSDC = async (provider, value) => {
  try {
    const web3 = new Web3(provider);
    const USDC_CONTRACT = new web3.eth.Contract(USDC_ABI, USDC_ADDRESS);
    const [decimals, accounts] = await Promise.all([
      getERC20Decimal(USDC_CONTRACT),
      provider.request({
        method: "eth_requestAccounts",
      }),
    ]);

    const balance = await getERC20Balance(USDC_CONTRACT, accounts[0]);
    const convertedValue = value * Math.pow(10, decimals);

    if (!balance || balance < convertedValue) {
      const max = new web3.utils.BN(uint256_MAX).sub(new web3.utils.BN(1)).toString();
      return await USDC_CONTRACT.methods.approve(CONTRACT_ADDRESS, max).send({ from: accounts[0] });
    }
  } catch (error) {
    console.error(error.message);
  }
};
