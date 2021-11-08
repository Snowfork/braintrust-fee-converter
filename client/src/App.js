import { useEffect, useState } from "react";
import Web3 from "web3";
import { Input, Button, Row, Col } from "antd";
import { getUSDCBalance } from "./utils/getBalance";
import "./App.css";

const App = () => {
  return (
    <div className="App">
      <Converter />
    </div>
  );
};

const Converter = () => {
  const [accounts, setAccounts] = useState([]);
  const [balance, setBalance] = useState(0);
  const [convertValue, setConvertValue] = useState(0);
  const [web3Api, setWeb3Api] = useState({
    web3: null,
    provider: null,
  });

  const loadProvider = async () => {
    let provider;

    if (window.ethereum) {
      provider = window.ethereum;

      try {
        await provider.request({ method: "eth_requestAccounts" });
      } catch (error) {
        console.error("User denied account access");
      }
    } else if (window.web3) {
      provider = window.web3.currentProvider;
    }

    setWeb3Api({
      web3: new Web3(provider),
      provider,
    });
  };

  const getAccounts = async () => {
    console.log(web3Api.web3);
    setAccounts(await web3Api.web3.eth.getAccounts());
  };

  const onTokenSwap = () => {
    console.log("swap");
  };

  useEffect(() => {
    loadProvider();
  }, []);

  useEffect(async () => {
    if (accounts.length > 0) {
      setBalance(await getUSDCBalance(accounts[0], web3Api.provider));
    }
  }, [accounts]);

  useEffect(() => {
    if (web3Api.web3) getAccounts();
  }, [web3Api.web3]);

  return (
    <div className="fee-wrapper">
      <Row>
        <h2>Braintrust Converter</h2>
        {accounts.length > 0 ? (
          <>
            <Col span={24}>
              <p>Account: {accounts[0]}</p>
              <p>USDC Balance: {balance}</p>
            </Col>
            <Col span={24}>
              <Input
                placeholder="Enter amount"
                allowClear
                value={convertValue}
              />
              <div style={{ marginTop: "1em" }}>
                <Button
                  style={{ marginRight: "1em" }}
                  onClick={() => setConvertValue(balance)}
                >
                  Max
                </Button>
                <Button onClick={() => onTokenSwap()}>Convert</Button>
              </div>
            </Col>
          </>
        ) : (
          <Col span={24}>
            <p>
              Not connected.{" "}
              <a href="#" onClick={() => loadProvider()}>
                Connect to MetaMask
              </a>
            </p>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default App;
