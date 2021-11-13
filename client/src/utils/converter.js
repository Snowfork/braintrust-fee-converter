import Web3 from "web3";
import { approveUSDC } from "./usdc";
import { CONTRACT_ABI } from "./abi";
import { abi as IUniswapV3PoolABI } from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";
// import { abi as QUOTER_ABI } from "@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json";

const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;
const POOL_ADDRESS = process.env.REACT_APP_UNI_POOL_ADDRESS;

export const swap = async (provider, amount) => {
  const web3 = new Web3(provider);
  const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
  const accounts = await provider.request({
    method: "eth_requestAccounts",
  });

  await approveUSDC(provider, amount);
  await contract.methods.swapExactInputSingle(`${amount * Math.pow(10, 6)}`).send({ from: accounts[0] });
};

export const getBTRSTPrice = async (provider, amount) => {
  const web3 = new Web3(provider);
  const poolContract = new web3.eth.Contract(IUniswapV3PoolABI, POOL_ADDRESS, provider);
  // const accounts = await provider.request({
  //   method: "eth_requestAccounts",
  // });

  const [fee] = await Promise.all([
    // poolContract.factory(),
    poolContract.methods.fee(),
    // poolContract.tickSpacing(),
    // poolContract.maxLiquidityPerTick(),
  ]);

  try {
    return await fee.call(async (error, res) => {
      return `Estimated price: ${res} BTRST`;
    });
  } catch (error) {
    return error.message;
  }
  // const QUOTER_ADDRESS = "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6";
  // const contract = new web3.eth.Contract(QUOTER_ABI, QUOTER_ADDRESS);
  // console.log(token0, token1, fee, amount, 0);
  // return await contract.methods.quoteExactInputSingle(token0, token1, fee, amount, 0).call();
};

export const transactionReceiptLog = async (web3) => {
  console.log(
    await web3.eth.getTransactionReceipt(
      "0x8caa180ba2570f5c31d0b3dbcf7496ed7ecfbcadbbfaa10f592e142be203fd22",
      (e, data) => {
        console.log(e, data);
      }
    )
  );
};
