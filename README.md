# Overview

Smart contract for NEAR blockchain that allows you to stash your NEAR for a provided period of time. You will only be able to get your NEAR back after the period expires.

## Contract interface

- ```
  deposit(lockPeriodInMinutes: u64): void
  ```
    Deposits attached NEAR to the contract and locks it for a specified period.

- ```
  withdraw(): void
  ```
    Withdraws NEAR to the caller if lock period expired.

# Develop

- `yarn` to install dependencies
- `yarn build` to build the project
- `yarn build:release` to build in release mode
- `yarn test` to run unit tests


# TODO
- Add fungible tokens support
- Add NFT support
- Add build/deploy bash scripts
- Fix potential bug when withdrawal is pending: [index.ts](./src/contract/assembly/index.ts#L49)
- Add multiple deposits per user
- Charge for data storage
- Add UI
- Port to RUST
- Add simulation tests