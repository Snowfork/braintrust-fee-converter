pragma solidity >=0.8.0 <0.9.0;
import '@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol';
import '@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol';

contract BrainTrustFeeConverterContract {
  address public immutable TreasuryAddress;
  address public immutable USDC;
  address public immutable BTRST;

  ISwapRouter public immutable swapRouter;

  uint24 public immutable poolFee;

  constructor(ISwapRouter _swapRouter, address _treasuryAddress, address _usdc, address _btrst, uint24 _poolFee) {
    swapRouter = _swapRouter;
    TreasuryAddress = _treasuryAddress;
    USDC = _usdc;
    BTRST = _btrst;
    poolFee = _poolFee;
  }

  function swapExactInputSingle(uint256 amountIn, uint256 amountOutMin) external returns (uint256 amountOut) {
    TransferHelper.safeTransferFrom(USDC, msg.sender, address(this), amountIn);
    TransferHelper.safeApprove(USDC, address(swapRouter), amountIn);

    // Naively set amountOutMinimum to 0. In production, use an oracle or other data source to choose a safer value for amountOutMinimum.
    // We also set the sqrtPriceLimitx96 to be 0 to ensure we swap our exact input amount.
    ISwapRouter.ExactInputSingleParams memory params = ISwapRouter.ExactInputSingleParams({
      tokenIn: USDC,
      tokenOut: BTRST,
      fee: poolFee,
      recipient: TreasuryAddress,
      deadline: block.timestamp,
      amountIn: amountIn,
      amountOutMinimum: amountOutMin,
      sqrtPriceLimitX96: 0
    });

    // The call to `exactInputSingle` executes the swap.
    amountOut = swapRouter.exactInputSingle(params);
  }
}