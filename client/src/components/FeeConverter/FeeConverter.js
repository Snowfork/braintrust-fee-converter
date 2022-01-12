import { useEffect, useState } from "react";
import { Input, Button, Row, Col } from "antd";
import detectEthereumProvider from "@metamask/detect-provider";
import Web3 from "web3";

import { getUSDCBalance } from "../../utils/usdc";
import { estimateBTRSTOutput, swapToBTRST } from "../../utils/converter";
import { getAmountOutMin, makeCancelable } from "../../utils/shared";

import logo from "../../assets/braintrust.png";
import usdc from "../../assets/usdc.svg";

import "./FeeConverter.scss";

const expectedChainId = Number(process.env.REACT_APP_EXPECTED_CHAIN_ID);

const FeeConverter = () => {
  const defaultSlippageTolerance = Number(process.env.REACT_APP_DEFAULT_SLIPPAGE_TOLERANCE);
  const defaultDeadline = Number(process.env.REACT_APP_DEFAULT_DEADLINE);

  const [account, setAccount] = useState(null); // Currently connected Metamask account
  const [balance, setBalance] = useState(0); // Balance of account in USDC
  const [convertValue, setConvertValue] = useState(0); // Amount input by user
  const [slippageToleranceValue, setSlippageToleranceValue] = useState(defaultSlippageTolerance); // Slippage input by user
  const [deadline, setDeadline] = useState(defaultDeadline); // Slippage input by user
  const [isExpectedChainId, setIsExpectedChainId] = useState(false); // Chain type
  const [web3Api, setWeb3Api] = useState(null); // Web3 provider
  const [estimate, setEstimate] = useState({}); // Estimated results of BTRST swap based on convertValue
  const [amountOutMin, setAmountOutMin] = useState(0); // Amount out minimum used for swap
  const [loadingEstimate, setLoadingEstimate] = useState(false); // Whether swap estimate is loading or not
  const [isLoading, setLoading] = useState(false); // Loading state on button when swapping
  const [lastEstimatePromise, setLastEstimatePromise] = useState(undefined); // Track estimate promise so it can be cancelled if needed

  const onTokenSwap = async () => {
    setLoading(true);
    const swap = await swapToBTRST(web3Api.provider, convertValue, slippageToleranceValue, estimate.estimatedOutput, deadline);

    if (swap) {
      const balance = await getUSDCBalance(account, web3Api.provider);
      if (balance) setBalance(balance);
      setConvertValue(0);
    }

    setLoading(false);
  };

  const onConvertValueChange = (e) => {
    if (!isNaN(e.target.value)) {
      setConvertValue(e.target.value);
    }
  };

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
    if (!isNaN(value)) setSlippageToleranceValue(e.target.value || defaultSlippageTolerance);
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
    const onMinAmountHandler = async () => {
      const { amountOutMin } = await getAmountOutMin(web3Api.provider, convertValue, slippageToleranceValue, estimate.estimatedOutput)
      setAmountOutMin(amountOutMin)
    }

    if (web3Api && web3Api.provider && convertValue > 0) {
      onMinAmountHandler()
    }
  }, [web3Api, convertValue, slippageToleranceValue, estimate])

  useEffect(() => {
    const onSetBalance = async () => {
      // Balance is readjusted based on currently connected account
      if (isExpectedChainId) {
        const balance = await getUSDCBalance(account, web3Api.provider);
        if (balance) setBalance(balance);
      }
    };

    const onEstimate = async () => {
      if (isExpectedChainId && convertValue > 0) {
        setLoadingEstimate(true);
        const cancellablePromise = makeCancelable(estimateBTRSTOutput(web3Api.provider, convertValue))
        cancellablePromise.promise.then(estimate => {
          setLoadingEstimate(false);
          setEstimate(estimate);
        }).catch(e => console.log(`cancelled estimate for ${convertValue}`));
        setLastEstimatePromise(cancellablePromise);
      }
    };

    if (account && web3Api.provider) {
      onSetBalance();
    }

    if (web3Api && web3Api.provider && convertValue) {
      if (lastEstimatePromise) {
        lastEstimatePromise.cancel();
      }
      onEstimate()
    };
  }, [account, isExpectedChainId, web3Api, convertValue, balance]); // eslint-disable-next-line react-hooks/exhaustive-deps

  const slippageTooHigh = estimate.estimatedSlippage >= process.env.REACT_APP_MAXIMUM_BASE_SLIPPAGE;

  return (
    <Row className="wrapper">
      <Header />
      {account ? (
        <>
          <AccountInfo
            account={account}
            balance={balance}
            isExpectedChainId={isExpectedChainId}
          />
          <ConverterInput
            isExpectedChainId={isExpectedChainId}
            balance={balance}
            convertValue={convertValue}
            slippageToleranceValue={slippageToleranceValue}
            isLoading={isLoading}
            onConvertValueChange={onConvertValueChange}
            onSlippageChange={onSlippageChange}
            setConvertValue={setConvertValue}
            onTokenSwap={onTokenSwap}
            onDeadlineChange={onDeadlineChange}
            deadline={deadline}
            estimate={estimate}
            amountOutMin={amountOutMin}
            slippageTooHigh={slippageTooHigh}
            loadingEstimate={loadingEstimate}
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

const AccountInfo = ({ account, balance, isExpectedChainId }) => (
  <Col span={24} className="wrapper__info">
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

const ConvertInfo = ({ balance, convertValue, estimate, amountOutMin, loadingEstimate, slippageTooHigh, slippageToleranceValue }) => (
  <Col span={24} style={{ marginTop: '0.5em' }}>
    {loadingEstimate && <Col span={24} className="">
      <p>Loading expected price...</p>
    </Col>
    }
    {!loadingEstimate && <Col span={24}>
      {estimate.estimatedOutput && convertValue ? <div>
        <div>Current BTRST Price: {estimate.currentPrice.toFixed(2)} USDC per BTRST</div>
        <div>Expected Swap Price: ~{estimate.estimatedPrice.toFixed(2)} USDC per BTRST</div>
        <div>Expected Slippage: ~{(estimate.estimatedSlippage * 100).toFixed(2)}%</div>
        <div>Expected BTRST swapped: {estimate.estimatedOutput.toFixed(2)} BTRST</div>
        <div>Minimum BTRST swapped: {amountOutMin.toFixed(2)}</div>
      </div> : null}
      {estimate.error && <p className="wrapper__error">{estimate.error}</p>}
    </Col>}
    {convertValue > balance && (
      <Col span={24} className="wrapper__error">
        Error: Insufficient balance for this swap
      </Col>
    )}
    {!loadingEstimate && slippageTooHigh && (
      <Col span={24} className="wrapper__error">
        Error: Slippage too high
      </Col>
    )}
    {slippageToleranceValue < process.env.REACT_APP_DEFAULT_SLIPPAGE_TOLERANCE && (
      <div className="wrapper__warning">Warning: Transaction may fail due to low slippage tolerance</div>
    )}
  </Col>
);

const ConverterInput = ({
  isExpectedChainId,
  isLoading,
  balance,
  convertValue,
  slippageToleranceValue,
  onConvertValueChange,
  onSlippageChange,
  setConvertValue,
  onTokenSwap,
  onDeadlineChange,
  deadline,
  estimate,
  amountOutMin,
  slippageTooHigh,
  loadingEstimate
}) => (
  <Col xs={{ span: 24 }} sm={{ span: 24 }} >
    {isExpectedChainId ? (
      <>
        <Row className="wrapper__input">
          <Col xs={{ span: 24 }} sm={{ span: 11 }}>
            <Row>
              <Input
                max={balance}
                placeholder="Enter USDC to convert"
                allowClear
                value={convertValue}
                onChange={(e) => onConvertValueChange(e)}
              />
            </Row>
          </Col>
          <Col xs={{ span: 24 }} sm={{ span: 11, offset: 2 }}>
            <Row className="wrapper__slippage">
              <div>Extra Slippage Tolerance (%)</div>
              <Input allowClear defaultValue={1} value={slippageToleranceValue} onChange={(e) => onSlippageChange(e)} />
            </Row>
            <Row className="wrapper__slippage">
              <div className="wrapper__input">
                <span>Deadline (s)</span>
                <Input allowClear defaultValue={1200} value={deadline} onChange={(e) => onDeadlineChange(e)} />
              </div>
            </Row>
          </Col>
        </Row>
        {convertValue && convertValue !== '0' ? <>
          <Row>
            <Col>
              <ConvertInfo
                balance={balance}
                convertValue={convertValue}
                estimate={estimate}
                amountOutMin={amountOutMin}
                slippageTooHigh={slippageTooHigh}
                loadingEstimate={loadingEstimate}
                slippageToleranceValue={slippageToleranceValue}
              />
            </Col>
          </Row>
        </> : undefined}
        <Row >
          <Col xs={{ span: 24 }} lg={{ span: 24 }} className="wrapper__input wrapper__buttons">
            <Button
              className="wrapper__button"
              disabled={convertValue === balance}
              onClick={() => setConvertValue(balance)}
            >
              Max
            </Button>
            <Button
              className="wrapper__button"
              disabled={convertValue <= 0 || convertValue > balance || estimate.error || loadingEstimate || slippageTooHigh}
              onClick={() => onTokenSwap()}
              loading={isLoading}
            >
              Convert
            </Button>
          </Col>
        </Row>
      </>
    ) : (
      <Col>
        <div>
          {!expectedChainId && <p>Did you forget to set your .env config?</p>}
          {expectedChainId ? <p>Please connect to the {expectedChainId === 1 && 'Mainnet'} {expectedChainId === 4 && 'Rinkeby'} network.</p> : <></>}
        </div>
      </Col>
    )}
  </Col >
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
