import { useEffect, useState } from "react";
import { Input, Button, Row, Col } from "antd";
import detectEthereumProvider from "@metamask/detect-provider";
import Web3 from "web3";

import { getUSDCBalance } from "../../utils/usdc";
import { getBTRSTPrice, swapToBTRST } from "../../utils/converter";

import logo from "../../assets/braintrust.png";
import usdc from "../../assets/usdc.svg";

import "./FeeConverter.scss";

const FeeConverter = () => {
  const [account, setAccount] = useState(null); // Currently connected Metamask account
  const [balance, setBalance] = useState(null); // Balance of account in USDC
  const [convertValue, setConvertValue] = useState(0); // Amount input by user
  const [slippageValue, setSlippageValue] = useState(0.3); // Slippage input by user
  const [isRinkeby, setIsRinkeby] = useState(false); // Chain type
  const [web3Api, setWeb3Api] = useState(null); // Web3 provider
  const [quotedPrice, setQuotedPrice] = useState(null); // Quoted BTRST price based on convertValue

  const onTokenSwap = async () => {
    swapToBTRST(web3Api.provider, convertValue);
  };

  useEffect(() => {
    const onQuotePrice = async () => {
      if (isRinkeby) {
        const message = await getBTRSTPrice(web3Api.provider, convertValue);
        setQuotedPrice(message);
      }
    };

    if (web3Api && web3Api.provider) onQuotePrice();
  }, [web3Api, convertValue, isRinkeby]);

  const onInitProvider = async () => {
    const provider = await detectEthereumProvider({ mustBeMetaMask: true });
    if (provider && !web3Api) {
      setWeb3Api({
        web3: new Web3(provider),
        provider,
      });
    }

    if (web3Api && web3Api.provider) {
      await web3Api.provider.request({
        method: "eth_requestAccounts",
      });
    }
  };

  useEffect(() => {
    // Detect whether a provider exists & MetaMask is installed
    const onLoadProvider = async (requestAccounts) => {
      const provider = await detectEthereumProvider({ mustBeMetaMask: true });
      if (provider && requestAccounts) {
        setWeb3Api({
          web3: new Web3(provider),
          provider,
        });

        if (!account) {
          const accounts = await provider.request({
            method: "eth_requestAccounts",
          });

          // Rinkeby chainId = 4
          const chainId = await new Web3(provider).eth.net.getId();
          setIsRinkeby(chainId === 4);
          setAccount(accounts[0]);
        }
      }
    };

    const onLoadEventListeners = () => {
      // Event listener when provider is initialized
      window.ethereum.on("connect", async () => {
        console.log("Connected");
        onLoadProvider(true);
      });

      // Event listener when account changes to reset provider
      window.ethereum.on("accountsChanged", async () => {
        console.log("Account changed");
        onLoadProvider(!!account);
        window.location.reload();
      });

      // Event listener when chain changes to reset provider
      window.ethereum.on("chainChanged", async () => {
        console.log("Network changed");
        onLoadProvider(!!account);
      });
    };

    onLoadEventListeners();
    onLoadProvider();
  }, [account]);

  useEffect(() => {
    const requestAccounts = async () => {
      // When provider is reset, acquire the current (first) account connected
      if (web3Api && web3Api.provider && web3Api.web3) {
        const accounts = await web3Api.provider.request({
          method: "eth_requestAccounts",
        });

        const chainId = await web3Api.web3.eth.net.getId(); // Rinkeby chainId = 4
        setIsRinkeby(chainId === 4);
        setAccount(accounts[0]);
      } else {
        const provider = await detectEthereumProvider({ mustBeMetaMask: true });

        if (!provider) {
          console.error("MetaMask is not installed, please install and try again.");
        }
      }
    };

    requestAccounts();
  }, [web3Api]);

  useEffect(() => {
    const onSetBalance = async () => {
      // Balance is readjusted based on currently connected account
      if (isRinkeby) {
        setBalance(await getUSDCBalance(account, web3Api.provider));
      }
    };

    if (account && web3Api.provider) {
      setTimeout(() => {
        onSetBalance();
      });
    }
  }, [account, isRinkeby, web3Api]);

  return (
    <Row className="wrapper">
      <Col span={24}>
        <h2 className="wrapper__header">
          <img src={logo} alt="logo" /> <span>Braintrust Fee Converter</span>
        </h2>
      </Col>
      {account ? (
        <>
          <Col span={24} className="wrapper__info">
            <div className="wrapper__info-row">
              <p>Account: </p>
              <p>{account}</p>
            </div>
            {isRinkeby && (
              <div className="wrapper__info-row">
                <p>Balance: </p>
                <p>
                  {balance} <img src={usdc} alt="usdc" />
                </p>
                {convertValue && quotedPrice ? <p>Estimated price: {quotedPrice} BTRST</p> : null}
              </div>
            )}
          </Col>
          <Col span={24} className="wrapper__input">
            {isRinkeby ? (
              <>
                <Row>
                  <Col xs={{ span: 24 }} sm={{ span: 11 }}>
                    <Input
                      max={balance}
                      placeholder="Enter amount to convert"
                      allowClear
                      value={convertValue}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        if (!isNaN(value)) setConvertValue(e.target.value);
                      }}
                    />
                  </Col>
                  <Col xs={{ span: 24 }} sm={{ span: 11, offset: 2 }}>
                    <div className="wrapper__slippage">
                      <span>Slippage (%)</span>
                      <Input
                        allowClear
                        defaultValue={0.3}
                        value={slippageValue}
                        onChange={(e) => {
                          const value = Number(e.target.value);
                          if (!isNaN(value)) setSlippageValue(e.target.value);
                        }}
                      />
                    </div>
                  </Col>
                  {convertValue > balance && (
                    <Col span={24}>
                      <p style={{ color: "#aaa" }}>Insufficient balance for this swap</p>
                    </Col>
                  )}
                </Row>
                <Row className="wrapper__footer">
                  <Col span={{ xs: 24, lg: 12 }} className="wrapper__buttons">
                    <Button
                      className="wrapper__button"
                      disabled={convertValue === balance}
                      onClick={() => setConvertValue(balance)}
                    >
                      Max
                    </Button>
                    <Button
                      className="wrapper__button"
                      disabled={convertValue <= 0 || convertValue > balance}
                      onClick={() => onTokenSwap()}
                    >
                      Convert
                    </Button>
                  </Col>
                </Row>
              </>
            ) : (
              <p>Please connect to the Rinkeby testnet.</p>
            )}
          </Col>
        </>
      ) : (
        <Col span={24} className="wrapper__unconnected">
          <Row>
            <p>Not connected.</p>
            <Button onClick={() => onInitProvider()}>Connect to MetaMask.</Button>
          </Row>
        </Col>
      )}
    </Row>
  );
};

export default FeeConverter;
