import { ethers } from "ethers";
import { Pool } from "@uniswap/v3-sdk";
import { Token } from "@uniswap/sdk-core";
import { abi as IUniswapV3PoolABI } from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";
import { Button, Col, Input, Row } from "antd";
import { useState } from "react";
import Web3 from "web3";

const provider = new ethers.providers.JsonRpcProvider("https://rinkeby.infura.io/v3/985283e724c54337a2425de696dae81c");
const poolAddress = "0x8ad599c3A0ff1De082011EFDDc58f1908eb6e6D8";
const poolContract = new ethers.Contract(poolAddress, IUniswapV3PoolABI, provider);

export default function Uniswap({ price, userSigner, localProvider, address, blockExplorer, contractConfig }) {
  const [web3Api, setWeb3Api] = useState({
    provider: null,
    web3: null,
    contract: null
  });
  
  const [amount, setAmount] = useState(0);
  const onSend = () => {
    console.log(amount);
  };

  const addFunds = useCallback(async () => {
    const { contract, web3 } = web3Api
    await contract.addFunds({
      from: account,
      value: web3.utils.toWei("1", "ether")
    })

    // window.location.reload()
  }, [web3Api, account])

  return (
    <div>
      <Row style={{ marginTop: "2em" }}>
        <Col offset={10} span={4}>
          <p>Enter an amount to send:</p>
          <Row>
            <Col span={20}>
              <Input addonBefore="USDC" value={amount} onChange={e => setAmount(e.target.value)}></Input>
            </Col>
            <Col span={4}>
              <Button onClick={() => onSend()}>Send</Button>
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
}
