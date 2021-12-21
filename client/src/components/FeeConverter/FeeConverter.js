import { useEffect, useState } from "react";
import { Input, Button, Row, Col } from "antd";
import detectEthereumProvider from "@metamask/detect-provider";
import Web3 from "web3";

import { getUSDCBalance } from "../../utils/usdc";
import { getBTRSTPrice, swapToBTRST } from "../../utils/converter";

import logo from "../../assets/braintrust.png";
import usdc from "../../assets/usdc.svg";

import "./FeeConverter.scss";
import { getAmountOutMin } from "../../utils/shared";

const expectedChainId = Number(process.env.REACT_APP_EXPECTED_CHAIN_ID);

const FeeConverter = () => {
  const defaultSlippage = Number(process.env.REACT_APP_DEFAULT_SLIPPAGE);
  const defaultDeadline = Number(process.env.REACT_APP_DEFAULT_DEADLINE);

  const [account, setAccount] = useState(null); // Currently connected Metamask account
  const [balance, setBalance] = useState(0); // Balance of account in USDC
  const [convertValue, setConvertValue] = useState(0); // Amount input by user
  const [slippageValue, setSlippageValue] = useState(defaultSlippage); // Slippage input by user
  const [deadline, setDeadline] = useState(defaultDeadline); // Slippage input by user
  const [isExpectedChainId, setIsExpectedChainId] = useState(false); // Chain type
  const [web3Api, setWeb3Api] = useState(null); // Web3 provider
  const [quotedPrice, setQuotedPrice] = useState(null); // Quoted BTRST price based on convertValue
  const [isLoading, setLoading] = useState(false); // Loading state on button when swapping
  const [minOutValue, setMinOutValue] = useState(0); // Amount input by user

  const onTokenSwap = async () => {
    setLoading(true);
    const swap = await swapToBTRST(web3Api.provider, convertValue, slippageValue, quotedPrice, deadline);

    if (swap) {
      const balance = await getUSDCBalance(account, web3Api.provider);
      if (balance) setBalance(balance);
      setConvertValue(0);
      setMinOutValue(0);
    }

    setLoading(false);
  };

  const onConvertValueChange = (e) => {
    if (!isNaN(e.target.value)) {
      setConvertValue(e.target.value);
    }
  };



  useEffect(() => {
    const onMinAmountHandler = async () => {
      const { amountOutMin } = await getAmountOutMin(web3Api.provider, convertValue, slippageValue, quotedPrice)
      setMinOutValue(amountOutMin)
    }

    if (web3Api && web3Api.provider) {
      onMinAmountHandler()
    }
  }, [web3Api, convertValue, slippageValue, quotedPrice])

  const onInitProvider = async () => {
    const provider = await detectEthereumProvider({ mustBeMetaMask: true });

    // If uninitialized, set the provider
    if (provider && !web3Api) {
      setWeb3Api({
        web3: new Web3(provider),
        provider,
      });
    }

    // Request accounts when MetaMask is connected
    if (web3Api && web3Api.provider) {
      await web3Api.provider.request({
        method: "eth_requestAccounts",
      });
    }
  };

  const onSlippageChange = (e) => {
    const value = Number(e.target.value);
    if (!isNaN(value)) setSlippageValue(e.target.value || 1);
  };

  const onDeadlineChange = (e) => {
    const value = Number(e.target.value);
    if (!isNaN(value)) setDeadline(e.target.value || 1200);
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

          const chainId = await new Web3(provider).eth.net.getId();
          setIsExpectedChainId(chainId === expectedChainId);
          setAccount(accounts[0]);
        }
      }
    };

    const onLoadEventListeners = () => {
      // Event listener when provider is initialized
      window.ethereum.on("connect", async () => {
        setTimeout(() => {
          console.log("Connected");
          onLoadProvider(true);
        }, 0);
      });

      // Event listener when account changes to reset provider
      window.ethereum.on("accountsChanged", async () => {
        setTimeout(() => {
          console.log("Account changed");
          onLoadProvider(!!account);
          window.location.reload();
        }, 0);
      });

      // Event listener when chain changes to reset provider
      window.ethereum.on("chainChanged", async () => {
        setTimeout(() => {
          console.log("Network changed");
          onLoadProvider(!!account);
        }, 0);
      });
    };

    onLoadEventListeners();
    onLoadProvider();
  }, [account]);

  useEffect(() => {
    const onInit = async () => {
      if (!web3Api) {
        const provider = await detectEthereumProvider({ mustBeMetaMask: true });
        setWeb3Api({
          web3: new Web3(provider),
          provider,
        });
      }
    };

    const requestAccounts = async () => {
      // When provider is reset, acquire the current (first) account connected
      if (web3Api && web3Api.provider && web3Api.web3) {
        const accounts = await web3Api.provider.request({
          method: "eth_requestAccounts",
        });

        const chainId = await web3Api.web3.eth.net.getId();
        setIsExpectedChainId(chainId === expectedChainId);
        setAccount(accounts[0]);
      }
    };

    if (!web3Api) onInit();
    requestAccounts();
  }, [web3Api]);

  useEffect(() => {
    const onSetBalance = async () => {
      // Balance is readjusted based on currently connected account
      if (isExpectedChainId) {
        const balance = await getUSDCBalance(account, web3Api.provider);
        if (balance) setBalance(balance);
      }
    };

    const onQuotePrice = async () => {
      if (isExpectedChainId) {
        const message = await getBTRSTPrice(web3Api.provider);
        setQuotedPrice(message);
      }
    };

    if (account && web3Api.provider) {
      onSetBalance();
    }

    if (web3Api && web3Api.provider) onQuotePrice();
  }, [account, isExpectedChainId, web3Api]);

  return (
    <Row className="wrapper">
      <Header />
      {account ? (
        <>
          <AccountInfo
            account={account}
            balance={balance}
            isExpectedChainId={isExpectedChainId}
            convertValue={convertValue}
            quotedPrice={quotedPrice}
          />
          <ConverterInput
            isExpectedChainId={isExpectedChainId}
            balance={balance}
            convertValue={convertValue}
            slippageValue={slippageValue}
            isLoading={isLoading}
            onConvertValueChange={onConvertValueChange}
            onSlippageChange={onSlippageChange}
            setConvertValue={setConvertValue}
            onTokenSwap={onTokenSwap}
            onDeadlineChange={onDeadlineChange}
            deadline={deadline}
            minOutValue={minOutValue}
          />
        </>
      ) : (
        <Unconnected onInitProvider={onInitProvider} />
      )}
    </Row>
  );
};

const Header = () => (
  <Col span={24}>
    <h2 className="wrapper__header">
      <img src={logo} alt="logo" /> <span>Braintrust Fee Converter</span>
    </h2>
  </Col>
);

const AccountInfo = ({ account, balance, isExpectedChainId, convertValue, quotedPrice }) => (
  <Col span={24} className="wrapper__info">
    <div className="wrapper__info-row">
      {quotedPrice ? <p>Estimated price per token: {quotedPrice} USDC</p> : null}
    </div>
    <div className="wrapper__info-row">
      <p>Account: </p>
      <p>{account}</p>
    </div>
    {isExpectedChainId && (
      <div className="wrapper__info-row">
        <p>Balance: </p>
        <p>
          {balance} <img src={usdc} alt="usdc" />
        </p>
      </div>
    )}
  </Col>
);

const ConverterInput = ({
  isExpectedChainId,
  isLoading,
  balance,
  convertValue,
  slippageValue,
  onConvertValueChange,
  onSlippageChange,
  setConvertValue,
  onTokenSwap,
  onDeadlineChange,
  deadline,
  minOutValue
}) => (
  <Col span={24} className="wrapper__input">
    {isExpectedChainId ? (
      <>
        <Row>
          <Col xs={{ span: 24 }} sm={{ span: 11 }}>
            <Input
              max={balance}
              placeholder="Enter amount to convert"
              allowClear
              value={convertValue}
              onChange={(e) => onConvertValueChange(e)}
            />
          </Col>
          <Col xs={{ span: 24 }} sm={{ span: 11, offset: 2 }}>
            <div className="wrapper__slippage">
              <span>Slippage (%)</span>
              <Input allowClear defaultValue={1} value={slippageValue} onChange={(e) => onSlippageChange(e)} />
            </div>
          </Col>
          {convertValue > balance && (
            <Col span={24}>
              <p className="wrapper__warning">Insufficient balance for this swap</p>
            </Col>
          )}
        </Row>
        <Row className="wrapper__footer">
          <Col xs={{ span: 24 }} lg={{ span: 12 }} className="wrapper__buttons">
            <Button
              className="wrapper__button"
              disabled={convertValue === balance}
              onClick={() => setConvertValue(balance)}
            >
              Max
            </Button>
            <Button
              className="wrapper__button"
              disabled={convertValue <= 0 || convertValue > balance || minOutValue === 0}
              onClick={() => onTokenSwap()}
              loading={isLoading}
            >
              Convert
            </Button>
          </Col>
          <Col xs={{ span: 24 }} sm={{ span: 10, offset: 2 }}>
            <div className="wrapper__slippage">
              <span>Deadline (s)</span>
              <Input allowClear defaultValue={1200} value={deadline} onChange={(e) => onDeadlineChange(e)} />
            </div>
          </Col>
        </Row>
      </>
    ) : (
      <div>
        {!expectedChainId && <p>Did you forget to set your .env config?</p>}
        {expectedChainId ? <p>Please connect to the {expectedChainId === 1 && 'Mainnet'} {expectedChainId === 4 && 'Rinkeby'} network.</p> : <></>}
      </div>
    )}
  </Col>
);

const Unconnected = ({ onInitProvider }) => (
  <Col span={24} className="wrapper__unconnected">
    <Row>
      <p>Not connected.</p>
      <Button onClick={() => onInitProvider()}>Connect to MetaMask.</Button>
    </Row>
  </Col>
);

export default FeeConverter;
