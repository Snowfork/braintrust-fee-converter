export const getERC20Balance = async (contract, address) => {
  return contract.methods.balanceOf(address).call();
};

export const getERC20Decimal = async (contract) => {
  return await contract.methods.decimals().call();
};
