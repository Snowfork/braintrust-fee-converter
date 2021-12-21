# Fee Converter Contracts

## Installation
This project uses Hardhat. Install it based on instructions in https://hardhat.org/

## Setup and Usage

Copy the .env.example file and modify it with your own values

Then,

```shell
npm install
npx hardhat node
npx hardhat test
```

All tests should pass :)

## Deployment
We use scripts/deploy.ts for deployment. Modify the addresses in it if needed, then run:

```shell
npx hardhat run scripts/deploy.ts --network <network-name>
```

## Etherscan verification

To try out Etherscan verification, you first need to deploy a contract to an Ethereum network that's supported by Etherscan, such as Ropsten.

In this project, copy the .env.example file to a file named .env, and then edit it to fill in the details. Enter your Etherscan API key, your Ropsten node URL (eg from Alchemy), and the private key of the account which will send the deployment transaction. With a valid .env file in place, first deploy your contract as above.

Then, copy the deployment address as well as the deployment constructor parameters and run:

```shell
npx hardhat verify --network ropsten DEPLOYED_CONTRACT_ADDRESS PARAMETER_1 PARAMETER_2 PARAMETER_3 PARAMETER_4 PARAMETER_5
```

# Performance optimizations

For faster runs of your tests and scripts, consider skipping ts-node's type checking by setting the environment variable `TS_NODE_TRANSPILE_ONLY` to `1` in hardhat's environment. For more details see [the documentation](https://hardhat.org/guides/typescript.html#performance-optimizations).
