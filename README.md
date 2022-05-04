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
|     `6`      | AccountID does not have a valid invite code                                        |
|     `7`      | Invalid username; username is blocklisted                                          |
|     `8`      | Invalid username; username contains invalid characters                             |

## Legend: return values from onboardAccount

| Return value | Description                                                                             |
| :----------: | --------------------------------------------------------------------------------------- |
|     `0`      | Transaction sender not permitted to onboard account                                     |
|     `1`      | Successfully onboarded an accountId, they can proceed with registration ie. setUserInfo |
|     `2`      | Invalid accountId                                                                       |
|     `3`      | accountId has already been onboarded                                                    |

## Legend: return values from requestSetUserInfo

| Return value | Description                                                                        |
| :----------: | ---------------------------------------------------------------------------------- |
|     `1`      | Successful user-info update / registration request                                 |
|     `2`      | Length of given username is less than the minimum permissible length = 3           |
|     `3`      | Username already exists, and is owned by a different NEAR account                  |
|     `4`      | Length of given username exceeds maximum permissible length = 18<br>               |
|     `5`      | NEAR account associated with the transaction is already linked to another username |
|     `6`      | AccountID does not have a valid invite code                                        |
|     `7`      | Invalid username; username is **not** blocklisted                                  |
|     `8`      | Invalid username; username contains invalid characters                             |

## Legend: return values from verifySetUserInfo

| Return value | Description                                                                           |
| :----------: | ------------------------------------------------------------------------------------- |
|     `0`      | Transaction sender not permitted to onboard account                                   |
|     `1`      | Successful user-info update / registration                                            |
|     `2`      | Input username doesn't exist in the list of requested usernames to register           |
|     `3`      | Username already exists, and is owned by a different NEAR account                     |
|     `5`      | NEAR account associated with the input username is already linked to another username |

## Legend: classification code for banning

| Code | Description                                                                                                                                                                                                                           |
| :--: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `1`  | Content that is deemed illegal under United States law or Delaware state law, where Capsule Social, Inc. is based. This includes terrorism, fraud, extortion, and many types of pornography or non-consensual intimate imagery (NCII) |
| `2` | Specifically targeted, real threats of violence or incitement to violence, including wishing or hoping that someone experiences physical harm. Persistent, malicious, targeted harassment or incitement to harassment. Promoting or encouraging suicide |
| `3` | Pornography or sexually exploitative content. We do allow depictions of nudity for artistic, journalistic, or related purposes, as well as erotic literature. Users may be asked to self-identify non-porn adult content and may have their accounts locked if they do not identify content correctly |
| `4` | Extremely gruesome, violent content, or content glorifying violence |
| `5` | Non-consensually posting an individual’s confidential personal information such as, for example, home address, passport number, or social security number (”doxxing”) |
| `6` | Any content that is the result of a software or platform error or vulnerability |
| `7` | Plagiarism or the impersonation of any individual, group, or organization |
| `8` | Spam is also considered delistable content. Spam may take many forms, including but not limited to: repeated, unwanted, and/or unsolicited actions, automated or manual, that negatively affect users, groups, and/or the Blogchain platform itself; Content that is designed to further unlawful acts (such as phishing) or mislead recipients as to the source of the material (such as spoofing); Commercially-motivated spam that typically aims to drive traffic from Blogchain over to another website, service or initiative through backlinking or other inauthentic methods; Inauthentic engagements that try to make channels or content appear more popular than they are; Coordinated activity that attempts to artificially influence opinion through the use of multiple accounts, fake accounts, and/or scripting or automation |
