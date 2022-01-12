pragma solidity >=0.8.4;
import '@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol';
import '@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol';

/**
 * @title   BrainTrust Fee Converter
 * @notice  A vault that swaps USDC to BTRST and deposit into BrainTrust Treasury.
 */
contract BrainTrustFeeConverterContract {
  address public immutable TreasuryAddress;
  address public immutable USDC;
  address public immutable BTRST;

  ISwapRouter public immutable swapRouter;

  uint24 public immutable poolFee;

  /**
    * @param _swapRouter Underlying Uniswap V3 swap router
    * @param _treasuryAddress Treasury Address
    * @param _usdc USDC address
    * @param _btrst BTRST address
    * @param _poolFee Pool fee expressed as multiple of 1e-6
    */
  constructor(ISwapRouter _swapRouter, address _treasuryAddress, address _usdc, address _btrst, uint24 _poolFee) {
    swapRouter = _swapRouter;
    TreasuryAddress = _treasuryAddress;
    USDC = _usdc;
    BTRST = _btrst;
    poolFee = _poolFee;
  }

  /**
  * @param amountIn The amount of input tokens to send.
  * @param amountOutMin The minimum amount of output tokens that must be received for the transaction not to revert.
  * @param deadline Unix timestamp after which the transaction will revert.
  */
  function swapExactInputSingle(uint256 amountIn, uint256 amountOutMin, uint256 deadline) external returns (uint256 amountOut) {
    TransferHelper.safeTransferFrom(USDC, msg.sender, address(this), amountIn);
    TransferHelper.safeApprove(USDC, address(swapRouter), amountIn);

    ISwapRouter.ExactInputSingleParams memory params = ISwapRouter.ExactInputSingleParams({
      tokenIn: USDC,
      tokenOut: BTRST,
      fee: poolFee,
      recipient: TreasuryAddress,
      deadline: deadline,
      amountIn: amountIn,
      amountOutMinimum: amountOutMin,
      sqrtPriceLimitX96: 0
    });

    // The call to `exactInputSingle` executes the swap.
    amountOut = swapRouter.exactInputSingle(params);
  }
}