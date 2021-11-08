// import Contract from "web3-eth-contract";
import Web3 from "web3";

const minABI = [
  // balanceOf
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    type: "function",
  },
  // decimals
  {
    constant: true,
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    type: "function",
  },
];

const USDC = "0x4dbcdf9b62e891a7cec5a2568c3f4faf9e8abe2b";
const BTRST = "0xc24d9a9cb8be9e7ab8ab6b8231a3e924acab07af";

export const getUSDCBalance = async (walletAddress, provider) => {
  const web3 = new Web3(provider);
  const contract = new web3.eth.Contract(minABI, USDC);
  const balance = await contract.methods.balanceOf(walletAddress).call();
  const decimals = await contract.methods.decimals().call();
  return balance / Math.pow(10, decimals);
};
