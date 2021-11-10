import { useEffect, useState } from "react";
import { Input, Button, Row, Col } from "antd";
import detectEthereumProvider from "@metamask/detect-provider";
import Web3 from "web3";

import { getUSDCBalance } from "../../utils/usdc";
import logo from "../../assets/braintrust.svg";
import { swap } from "../../utils/converter";

const FeeConverter = () => {
  const [account, setAccount] = useState();
  const [balance, setBalance] = useState(0);
  const [convertValue, setConvertValue] = useState(0);
  const [isRinkeby, setIsRinkeby] = useState(false);
  const [web3Api, setWeb3Api] = useState(null);

  const onTokenSwap = async () => {
    swap(web3Api.provider, convertValue);
  };

  useEffect(() => {
    // Detect whether a provider exists & MetaMask is installed
    const loadProvider = async () => {
      const provider = await detectEthereumProvider({ mustBeMetaMask: true });

      if (provider) {
        setWeb3Api({
          web3: new Web3(provider),
          provider,
        });
      }
    };

    // Event listener when account changes to reset provider
    window.ethereum.on("accountsChanged", async () => {
      loadProvider();
    });

    // Event listener when chain changes to reset provider
    window.ethereum.on("chainChanged", async () => {
      loadProvider();
    });

    loadProvider();
  }, []);

  useEffect(() => {
    const requestAccounts = async () => {
      // When provider is reset, acquire the current (first) account connected
      if (web3Api && web3Api.provider && web3Api.web3) {
        const accounts = await web3Api.provider.request({
          method: "eth_requestAccounts",
        });

        // Rinkeby chainId = 4
        const chainId = await web3Api.web3.eth.net.getId();
        setIsRinkeby(chainId === 4);
        setAccount(accounts[0]);
      } else {
        const provider = await detectEthereumProvider({ mustBeMetaMask: true });

        if (!provider) {
          console.error(
            "MetaMask is not installed, please install and try again."
          );
        }
      }
    };

    requestAccounts();
  }, [web3Api]);

  useEffect(() => {
    const onSetBalance = async () => {
      // Balance is readjusted based on currently connected account
      setBalance(await getUSDCBalance(account, web3Api.provider));
    };

    if (account && web3Api.provider) onSetBalance();
  }, [account, web3Api]);

  return (
    <div className="fee-wrapper">
      <Row>
        <h2>
          <img src={logo} alt="logo" /> <span>Fee Converter</span>
        </h2>
        {account ? (
          <>
            <Col span={24}>
              <p>Account: {account}</p>
              {isRinkeby && <p>USDC Balance: {balance}</p>}
            </Col>
            <Col span={24}>
              {isRinkeby ? (
                <>
                  <Input
                    placeholder="Enter amount"
                    allowClear
                    value={convertValue}
                    onChange={(e) => setConvertValue(e.target.value)}
                  />
                  <div style={{ marginTop: "1em" }}>
                    <Button
                      style={{ marginRight: "1em" }}
                      onClick={() => setConvertValue(balance)}
                    >
                      Max
                    </Button>
                    <Button
                      disabled={convertValue <= 0}
                      onClick={() => onTokenSwap()}
                    >
                      Convert
                    </Button>
                  </div>
                </>
              ) : (
                <p>Please connect to the Rinkeby testnet</p>
              )}
            </Col>
          </>
        ) : (
          <Col span={24}>
            <p>
              Not connected.{" "}
              <Button
                onClick={() =>
                  web3Api.provider.request({
                    method: "eth_requestAccounts",
                  })
                }
              >
                Connect to MetaMask
              </Button>
            </p>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default FeeConverter;
