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
