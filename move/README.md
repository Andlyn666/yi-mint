# Yi Jing NFT - SUI Move Contract

This is the SUI Move contract for the Yi Jing NFT project. It allows for minting NFTs that represent hexagrams from the I Ching (Yi Jing).

## Prerequisites

1. Install SUI CLI
```bash
# Install SUI CLI
cargo install --locked --git https://github.com/MystenLabs/sui.git --branch testnet sui
```

2. Setup a SUI wallet
```bash
# Initialize a new Sui wallet
sui client new-address ed25519
```

3. Request test SUI tokens
```bash
# Request test tokens
sui client faucet
```

## Build and Publish the Contract

1. Build the contract
```bash
# Navigate to the move directory
cd move

# Build the contract
sui move build
```

2. Publish the contract
```bash
# Publish the contract to the SUI testnet
sui client publish --gas-budget 10000000
```

3. Update package ID in your app
After publishing, you'll get a package ID. Update the `PACKAGE_ID` in `src/app/lib/suiUtils.ts` with this value.

## Contract Structure

- `YiJingNFT`: The NFT structure that contains hexagram details
- `mint`: Function to mint a new NFT to a specified recipient

## Testing the Contract

You can test the contract with the SUI CLI:

```bash
# Mint an NFT (replace with your own values)
sui client call \
  --package <YOUR_PACKAGE_ID> \
  --module yi_jing_nft \
  --function mint \
  --args "Hexagram 1: Qian" "The Creative" "https://example.com/image.png" 1 "乾" "What is my future?" <RECIPIENT_ADDRESS> \
  --gas-budget 10000000
```

## Integration with the Frontend

Once you have deployed the contract, update the `PACKAGE_ID` in `src/app/lib/suiUtils.ts` with your deployed package ID, then the front-end will be able to mint real NFTs on the SUI blockchain. 