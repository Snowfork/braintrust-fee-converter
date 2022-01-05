import Web3 from "web3";
import { approveUSDC } from "./usdc";
import { BTRST_ABI, CONTRACT_ABI, USDC_ABI } from "./abi";
import { abi as IUniswapV3PoolABI } from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";
import { abi as QUOTER_ABI } from "@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json";
import { getERC20Decimal, getAmountOutMin } from "./shared";

const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;
const POOL_ADDRESS = process.env.REACT_APP_UNI_POOL_ADDRESS;
const QUOTER_ADDRESS = process.env.REACT_APP_UNI_QUOTER_ADDRESS;
const USDC_ADDRESS = process.env.REACT_APP_USDC_ADDRESS;
const BTRST_ADDRESS = process.env.REACT_APP_BTRST_ADDRESS;

export const swapToBTRST = async (provider, amount, slippage, quotePrice, deadline) => {
  try {
    const web3 = new Web3(provider);
    const CONVERTER_CONTRACT = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
    const BTRST_CONTRACT = new web3.eth.Contract(BTRST_ABI, BTRST_ADDRESS);
    const btrstDecimal = await getERC20Decimal(BTRST_CONTRACT)

    const accounts = await provider.request({
      method: "eth_requestAccounts"
    })

    await approveUSDC(provider, amount);
    const { amountOutMin, amountReal } = await getAmountOutMin(provider, amount, slippage, quotePrice)
    const txnDeadline = Math.floor(Date.now() / 1000) + deadline
    const amountOutMinimum = new web3.utils.toBN(amountOutMin * Math.pow(10, btrstDecimal))

    return await CONVERTER_CONTRACT.methods
      .swapExactInputSingle(amountReal, amountOutMinimum, txnDeadline)
      .send({ from: accounts[0] })
      .then((transaction) => transaction.status);
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const getBTRSTPrice = async (provider, convertValue) => {
  try {
    const web3 = new Web3(provider);
    const POOL_CONTRACT = new web3.eth.Contract(IUniswapV3PoolABI, POOL_ADDRESS, provider);
    const USDC_CONTRACT = new web3.eth.Contract(USDC_ABI, USDC_ADDRESS);
    const BTRST_CONTRACT = new web3.eth.Contract(BTRST_ABI, BTRST_ADDRESS);

    const [token0, token1, fee, USDC_decimals, BTRST_decimals] = await Promise.all([
      POOL_CONTRACT.methods.token0().call(),
      POOL_CONTRACT.methods.token1().call(),
      POOL_CONTRACT.methods.fee().call(),
      getERC20Decimal(USDC_CONTRACT),
      getERC20Decimal(BTRST_CONTRACT),
    ]);

    const QUOTER_CONTRACT = new web3.eth.Contract(QUOTER_ABI, QUOTER_ADDRESS);

    const result = await QUOTER_CONTRACT.methods
      .quoteExactInputSingle(token0, token1, fee, new web3.utils.toBN(convertValue * Math.pow(10, BTRST_decimals)), 0)
      .call();

    let expectedResult = await QUOTER_CONTRACT.methods
      .quoteExactInputSingle(token0, token1, fee, new web3.utils.toBN(1 * Math.pow(10, BTRST_decimals)), 0)
      .call();

    expectedResult = expectedResult * convertValue

    const priceImpact = 1 - (result / expectedResult)

    if (priceImpact > 0.5) {
      return "Price impact too large"
    }

    return result / Math.pow(10, USDC_decimals);
  } catch (error) {
    console.error(error);
    return "There is not enough liquidity to trade";
  }
};

export const transactionReceiptLog = async (web3, txHash) => {
  try {
    const txReceipt = await web3.eth.getTransactionReceipt(txHash);
    console.log(txReceipt);
  } catch (error) {
    console.error(error);
  }
};