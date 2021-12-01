# Capsule NEAR

A repository to store NEAR smart contracts used by Capsule

## Requirements

- [NEAR CLI](https://github.com/near/near-cli) - to deploy the smart contract
  - `npm install -g near-cli` (globally installs NEAR CLI)

## Installation

`yarn install` - Installs all dependencies

> **Warning**: One of the indirect dependencies of this repo -- `near-vm` does not support Darwin ARM64, so this repo can't be installed in your M1 as of today (20th October, 2021)

## Build Smart Contract

To build the contract, run `yarn asb` or `yarn asb build`. The .wasm file after successful build is located at: `build/release/capsule-near.wasm`

## Deploy Smart Contract

Make sure you have installed [NEAR CLI](https://github.com/near/near-cli) before moving any further.

For purposes of testing, you can create a dev-account on NEAR testnet and deploy the smart contract. To do this, simply run: `near dev-deploy build/release/capsule-near.wasm`

If you want to deploy it on a named testnet or mainnet account, run:

1. `near login` - login to the account you want to deploy the contract in. On successful login, a full access key is stored in `~/.near-credentials/` directory.
2. `near deploy --contractName=<your_NEAR_account_id> --keyPath=<absolute_path_to_near_credentials_file> --wasmFile=<wasm_file_to_deploy>`

**Example**: `near deploy --contractName=dev-1627894343033-9726641 --keyPath=/home/tomash/.near-credentials/testnet/dev-1627894343033-9726641.json --wasmFile=./build/release/capsule-near.json`

## Legend: return values from setUserInfo

When a user registers their account on capsule, the client calls `setUserInfo` function of the contract. `setUserInfo` returns an integer between 1 and 5, where each integer means the following:

| Return value | Description                                                                        |
| :----------: | ---------------------------------------------------------------------------------- |
|     `1`      | Successful user-info update / registration                                         |
|     `2`      | Length of given username is less than the minimum permissible length = 3           |
|     `3`      | Username already exists, and is owned by a different NEAR account                  |
|     `4`      | Length of given username exceeds maximum permissible length = 18<br>               |
|     `5`      | NEAR account associated with the transaction is already linked to another username |

## Legend: return values from setPrivateSub

When a user sets up a subscription on capsule, capsule-server calls `setPrivateSub` function of the contract. `setPrivateSub` returns an integer between 0 and 3, where each integer means the following:

| Return value | Description                                                       |
| :----------: | ----------------------------------------------------------------- |
|     `0`      | Transaction sender not permitted to initiate private subscription |
|     `1`      | Successfully initiated private subscription for a username        |
|     `2`      | User does not exist                                               |
|     `3`      | Private subscription for the user has already been initiated      |
