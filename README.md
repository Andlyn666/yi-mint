# 易经 NFT 占卜 (Yi Jing NFT Divination)

This is a decentralized application (DApp) that combines traditional Chinese Yi Jing (I Ching) divination with NFT technology on the SUI blockchain.

## Features

- Connect your SUI wallet (supports Sui Wallet, Ethos, Martian, etc.)
- Submit a question for divination
- Receive a hexagram result with NFT visualization
- Get an AI-powered interpretation of your hexagram

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- A SUI wallet browser extension

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/yi-mint.git
cd yi-mint
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Connect your SUI wallet by clicking on one of the wallet options
2. Enter your question (optional)
3. Click "占卜 & Mint NFT" to generate your hexagram
4. View your hexagram NFT and interpretation
5. Click "再次占卜" to perform another divination

## Tech Stack

- Next.js + React
- TypeScript
- Tailwind CSS
- SUI Blockchain (via @mysten/wallet-standard and @mysten/sui.js)

## Future Development

- Smart contract implementation for on-chain minting
- Integration with GPT API for more detailed interpretations
- Enhanced NFT visuals with animation
- Support for more SUI wallets

## License

This project is licensed under the MIT License - see the LICENSE file for details.
