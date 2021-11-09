import Web3 from "web3";
import { approveUSDC } from "./usdc";

const TreasuryAddress = "0xFaa23A05e630a8E3e5b48E5579Ef690E3961F49E";
const contractABI = [
  {
    inputs: [
      {
        internalType: "contract ISwapRouter",
        name: "_swapRouter",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "BTRST",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "TreasuryAddress",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "USDC",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "poolFee",
    outputs: [
      {
        internalType: "uint24",
        name: "",
        type: "uint24",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amountIn",
        type: "uint256",
      },
    ],
    name: "swapExactInputSingle",
    outputs: [
      {
        internalType: "uint256",
        name: "amountOut",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "swapRouter",
    outputs: [
      {
        internalType: "contract ISwapRouter",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const contractAddress = "0xD70a1B045Db31DF849B5A4C41FA826C21395ba1A";

export const swap = async (provider, amount) => {
  const web3 = new Web3(provider);
  const contract = new web3.eth.Contract(contractABI, contractAddress);

  const accounts = await provider.request({
    method: "eth_requestAccounts",
  });

  // await approver(provider, amount)
  // await receiptLog(web3);

  await contract.methods
    .swapExactInputSingle(`${amount}`)
    .send({ from: accounts[0] });
};

const approve = async (provider, amount) => {
  await approveUSDC(provider, amount);
};

const receiptLog = async (web3) => {
  console.log(
    await web3.eth.getTransactionReceipt(
      "0x8caa180ba2570f5c31d0b3dbcf7496ed7ecfbcadbbfaa10f592e142be203fd22",
      (e, data) => {
        console.log(e, data);
      }
    )
  );
};
