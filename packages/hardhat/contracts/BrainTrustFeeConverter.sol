pragma solidity >=0.8.0 <0.9.0;
pragma abicoder v2;
//SPDX-License-Identifier: MIT

import "hardhat/console.sol";
import '@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol';
import '@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol';

contract BrainTrustFeeConverterContract {
  address public constant treasuryAddress = "";
  address public constant USDC = 0x4DBCdF9B62e891a7cec5A2568C3F4FAF9E8Abe2b;
  address public constant BTRST = "";

  ISwapRouter public immutable swapRouter;

  constructor(ISwapRouter _swapRouter) {
    swapRouter = _swapRouter;
  }

  function swapExactInputSingle(uint256 amountIn) external returns (uint256 amountOut) {
    TransferHelper.safeTransferFrom(USDC, msg.sender, address(this), amountIn);
    TransferHelper.safeApprove(USDC, address(swapRouter), amountIn);

    // Naively set amountOutMinimum to 0. In production, use an oracle or other data source to choose a safer value for amountOutMinimum.
    // We also set the sqrtPriceLimitx96 to be 0 to ensure we swap our exact input amount.
    ISwapRouter.ExactInputSingleParams memory params = ISwapRouter.ExactInputSingleParams({
      tokenIn: USDC,
      tokenOut: BTRST,
      fee: poolFee,
      recipient: msg.sender,
      deadline: block.timestamp,
      amountIn: amountIn,
      amountOutMinimum: 0,
      sqrtPriceLimitX96: 0
    });

    // The call to `exactInputSingle` executes the swap.
    amountOut = swapRouter.exactInputSingle(params);

    // How do we interact with amountOut? 
    // Is it supposed to call a 2nd function in the contract to send?
    TransferHelper.safeTransfer(USDC, treasuryAddress, amountOut);
  }
}
