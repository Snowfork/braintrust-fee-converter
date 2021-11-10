import Web3 from "web3";
import { approveUSDC } from "./usdc";
import { CONTRACT_ABI } from "./abi";

const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;

export const swap = async (provider, amount) => {
  const web3 = new Web3(provider);
  console.log("Contract address:", CONTRACT_ADDRESS);
  const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);

  const accounts = await provider.request({
    method: "eth_requestAccounts",
  });

  await approveUSDC(provider, amount);
  // await receiptLog(web3);

  await contract.methods
    .swapExactInputSingle(`${amount}`)
    .send({ from: accounts[0] });
};

// const receiptLog = async (web3) => {
//   console.log(
//     await web3.eth.getTransactionReceipt(
//       "0x8caa180ba2570f5c31d0b3dbcf7496ed7ecfbcadbbfaa10f592e142be203fd22",
//       (e, data) => {
//         console.log(e, data);
//       }
//     )
//   );
// };
